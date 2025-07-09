import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import {
  getReceiverSocketId,
  io,
  emitReactionToRoom,
  emitReadReceiptToRoom,
} from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    // Convert all IDs to strings for frontend compatibility
    const messagesWithStringIds = messages.map((m) => ({
      ...m.toObject(),
      _id: m._id.toString(),
      senderId: m.senderId.toString(),
      receiverId: m.receiverId.toString(),
      groupId: m.groupId ? m.groupId.toString() : undefined,
    }));
    res.status(200).json(messagesWithStringIds);
  } catch (error) {
    console.error("Error in getMessages: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const { text, image } = req.body;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add or update a reaction to a message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;
    if (!emoji) return res.status(400).json({ message: "Emoji is required" });
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    // Remove any existing reaction by this user
    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== userId.toString()
    );
    // Add new reaction
    message.reactions.push({ userId, emoji });
    await message.save();
    // Emit real-time event
    emitReactionToRoom({
      message,
      groupId: message.groupId,
      receiverId: message.receiverId,
      senderId: message.senderId,
    });
    // Convert all IDs to strings for frontend compatibility
    const msgObj = message.toObject();
    msgObj._id = msgObj._id.toString();
    msgObj.senderId = msgObj.senderId.toString();
    if (msgObj.receiverId) msgObj.receiverId = msgObj.receiverId.toString();
    if (msgObj.groupId) msgObj.groupId = msgObj.groupId.toString();
    if (msgObj.reactions) {
      msgObj.reactions = msgObj.reactions.map((r) => ({
        ...r,
        userId: r.userId.toString(),
      }));
    }
    if (msgObj.readBy) {
      msgObj.readBy = msgObj.readBy.map((id) => id.toString());
    }
    res.status(200).json(msgObj);
  } catch (error) {
    console.error("Error in addReaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove a reaction from a message
export const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== userId.toString()
    );
    await message.save();
    // Emit real-time event
    emitReactionToRoom({
      message,
      groupId: message.groupId,
      receiverId: message.receiverId,
      senderId: message.senderId,
    });
    // Convert all IDs to strings for frontend compatibility
    const msgObj = message.toObject();
    msgObj._id = msgObj._id.toString();
    msgObj.senderId = msgObj.senderId.toString();
    if (msgObj.receiverId) msgObj.receiverId = msgObj.receiverId.toString();
    if (msgObj.groupId) msgObj.groupId = msgObj.groupId.toString();
    if (msgObj.reactions) {
      msgObj.reactions = msgObj.reactions.map((r) => ({
        ...r,
        userId: r.userId.toString(),
      }));
    }
    if (msgObj.readBy) {
      msgObj.readBy = msgObj.readBy.map((id) => id.toString());
    }
    res.status(200).json(msgObj);
  } catch (error) {
    console.error("Error in removeReaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark a message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (
      !message.readBy.map((id) => id.toString()).includes(userId.toString())
    ) {
      message.readBy.push(userId);
      await message.save();
      // Emit real-time event
      emitReadReceiptToRoom({
        message,
        groupId: message.groupId,
        receiverId: message.receiverId,
      });
    }
    res.status(200).json(message);
  } catch (error) {
    console.error("Error in markAsRead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
