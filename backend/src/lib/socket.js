import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("a user connected");
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Group chat: join/leave group rooms
  socket.on("joinGroup", async (groupId) => {
    socket.join(groupId);
  });
  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
  });

  // Real-time group message (optional: for direct socket sending)
  socket.on("sendGroupMessage", async ({ groupId, message }) => {
    io.to(groupId).emit("newGroupMessage", message);
  });

  // Real-time reactions
  socket.on("addReaction", ({ message, groupId, receiverId }) => {
    if (groupId) {
      io.to(groupId).emit("reactionUpdate", message);
    } else if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId);
      const senderSocketId = socket.id;
      if (receiverSocketId)
        io.to(receiverSocketId).emit("reactionUpdate", message);
      if (senderSocketId) io.to(senderSocketId).emit("reactionUpdate", message);
    }
  });
  socket.on("removeReaction", ({ message, groupId, receiverId }) => {
    if (groupId) {
      io.to(groupId).emit("reactionUpdate", message);
    } else if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId);
      const senderSocketId = socket.id;
      if (receiverSocketId)
        io.to(receiverSocketId).emit("reactionUpdate", message);
      if (senderSocketId) io.to(senderSocketId).emit("reactionUpdate", message);
    }
  });

  // Real-time read receipts
  socket.on("readReceipt", ({ message, groupId, receiverId }) => {
    if (groupId) {
      io.to(groupId).emit("readReceiptUpdate", message);
    } else if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId)
        io.to(receiverSocketId).emit("readReceiptUpdate", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Helper to emit group message after REST API call
export function emitGroupMessageToRoom(groupId, message) {
  io.to(groupId).emit("newGroupMessage", message);
}

// Helpers for reactions and read receipts
export function emitReactionToRoom({ message, groupId, receiverId, senderId }) {
  if (groupId) {
    io.to(groupId).emit("reactionUpdate", message);
  } else if (receiverId && senderId) {
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);
    if (receiverSocketId)
      io.to(receiverSocketId).emit("reactionUpdate", message);
    if (senderSocketId) io.to(senderSocketId).emit("reactionUpdate", message);
  } else if (receiverId) {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId)
      io.to(receiverSocketId).emit("reactionUpdate", message);
  }
}
export function emitReadReceiptToRoom({ message, groupId, receiverId }) {
  if (groupId) {
    io.to(groupId).emit("readReceiptUpdate", message);
  } else if (receiverId) {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId)
      io.to(receiverSocketId).emit("readReceiptUpdate", message);
  }
}

export { io, app, server };
