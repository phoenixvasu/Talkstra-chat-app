import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  addGroupMember,
  removeGroupMember,
  sendGroupMessage,
  getGroupMessages,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getUserGroups);
router.post("/:groupId/members", protectRoute, addGroupMember);
router.delete("/:groupId/members/:userId", protectRoute, removeGroupMember);
router.post("/:groupId/messages", protectRoute, sendGroupMessage);
router.get("/:groupId/messages", protectRoute, getGroupMessages);

export default router;
