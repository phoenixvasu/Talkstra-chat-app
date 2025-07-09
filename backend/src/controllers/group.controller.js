import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { emitGroupMessageToRoom } from "../lib/socket.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const creatorId = req.user._id;
    if (
      !name ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Group name and at least one member are required." });
    }
    // Add creator as admin and member
    const members = Array.from(new Set([...memberIds, creatorId.toString()]));
    const admins = [creatorId];
    const group = await Group.create({
      name,
      members,
      admins,
      createdBy: creatorId,
    });
    res.status(201).json(group);
  } catch (error) {
    console.error("Error in createGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// List groups for the logged-in user
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId });
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add a member to a group (admin only)
export const addGroupMember = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId } = req.params;
    const { memberId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.admins.includes(userId))
      return res.status(403).json({ message: "Only admins can add members" });
    if (group.members.includes(memberId))
      return res.status(400).json({ message: "User is already a member" });
    group.members.push(memberId);
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    console.error("Error in addGroupMember:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove a member from a group (admin only)
export const removeGroupMember = async (req, res) => {
  try {
    const userId = req.user._id;
    const { groupId, userId: memberId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.admins.includes(userId))
      return res
        .status(403)
        .json({ message: "Only admins can remove members" });
    if (!group.members.includes(memberId))
      return res.status(400).json({ message: "User is not a member" });
    group.members = group.members.filter((id) => id.toString() !== memberId);
    // Optionally, remove from admins if admin is removed
    group.admins = group.admins.filter((id) => id.toString() !== memberId);
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    console.error("Error in removeGroupMember:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send a message to a group
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const senderId = req.user._id;
    const { text, image } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.includes(senderId))
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    // Emit to group room
    emitGroupMessageToRoom(groupId, newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get messages for a group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.includes(userId))
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    const messages = await Message.find({ groupId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
