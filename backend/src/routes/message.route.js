import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  addReaction,
  removeReaction,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

// Message reactions and read receipts
router.post("/:messageId/reactions", protectRoute, addReaction);
router.delete("/:messageId/reactions", protectRoute, removeReaction);

export default router;
