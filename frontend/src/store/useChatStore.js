import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // Private chat state
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Group chat state
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,

  // Private chat actions
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      console.log("[getMessages] Setting messages:", res.data);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("[sendMessage] Error:", error);
      toast.error(error.response.data.message);
    }
  },

  // Remove subscribeToMessages and unSubscribeToMessages logic for private chat
  // Add global setupPrivateSocketListeners
  setupPrivateSocketListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    // Handler for newMessage
    const handleNewMessage = (newMessage) => {
      const { selectedUser } = get();
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    };
    socket.on("newMessage", handleNewMessage);
  },

  setSelectedUser: (selectedUser) => {
    console.log("[setSelectedUser] called with:", selectedUser);
    set({ selectedUser, selectedGroup: null, groupMessages: [] });
  },

  // Group chat actions
  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (name, memberIds) => {
    try {
      const res = await axiosInstance.post("/groups", { name, memberIds });
      set({ groups: [...get().groups, res.data] });
      toast.success("Group created!");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    const { groupMessages } = get();
    try {
      const res = await axiosInstance.post(
        `/groups/${groupId}/messages`,
        messageData
      );
      set({ groupMessages: [...groupMessages, res.data] });
    } catch (error) {
      console.error("[sendGroupMessage] Error:", error);
      toast.error(error.response.data.message);
    }
  },

  // No-ops: group room joining is handled globally
  subscribeToGroupMessages: () => {},
  unSubscribeToGroupMessages: () => {},

  setSelectedGroup: (group) => {
    console.log("[setSelectedGroup] called with:", group);
    set({ selectedGroup: group, selectedUser: null, messages: [] });
  },

  addGroupMember: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, {
        memberId,
      });
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup:
          state.selectedGroup && state.selectedGroup._id === groupId
            ? res.data
            : state.selectedGroup,
      }));
      toast.success("Member added");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  removeGroupMember: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.delete(
        `/groups/${groupId}/members/${memberId}`
      );
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup:
          state.selectedGroup && state.selectedGroup._id === groupId
            ? res.data
            : state.selectedGroup,
      }));
      toast.success("Member removed");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  addReaction: async (messageId, emoji, isGroup, groupId, receiverId) => {
    messageId = String(messageId);
    const socket = useAuthStore.getState().socket;
    try {
      const res = await axiosInstance.post(`/messages/${messageId}/reactions`, {
        emoji,
      });
      // Optimistically update state
      if (isGroup) {
        set((state) => ({
          groupMessages: state.groupMessages.map((m) =>
            String(m._id) === messageId ? res.data : m
          ),
        }));
        socket.emit("addReaction", { message: res.data, groupId });
      } else {
        set((state) => ({
          messages: state.messages.map((m) =>
            String(m._id) === messageId ? res.data : m
          ),
        }));
        socket.emit("addReaction", { message: res.data, receiverId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding reaction");
    }
  },
  removeReaction: async (messageId, isGroup, groupId, receiverId) => {
    messageId = String(messageId);
    const socket = useAuthStore.getState().socket;
    try {
      const res = await axiosInstance.delete(
        `/messages/${messageId}/reactions`
      );
      if (isGroup) {
        set((state) => ({
          groupMessages: state.groupMessages.map((m) =>
            String(m._id) === messageId ? res.data : m
          ),
        }));
        socket.emit("removeReaction", { message: res.data, groupId });
      } else {
        set((state) => ({
          messages: state.messages.map((m) =>
            String(m._id) === messageId ? res.data : m
          ),
        }));
        socket.emit("removeReaction", { message: res.data, receiverId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error removing reaction");
    }
  },
  setupGroupSocketListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    // groupUpdate: update or remove group
    const handleGroupUpdate = (group) => {
      if (group.removed) {
        set((state) => ({
          groups: state.groups.filter((g) => g._id !== group._id),
          selectedGroup:
            state.selectedGroup && state.selectedGroup._id === group._id
              ? null
              : state.selectedGroup,
        }));
      } else {
        set((state) => ({
          groups: state.groups.some((g) => g._id === group._id)
            ? state.groups.map((g) => (g._id === group._id ? group : g))
            : [...state.groups, group],
          selectedGroup:
            state.selectedGroup && state.selectedGroup._id === group._id
              ? group
              : state.selectedGroup,
        }));
      }
    };
    // groupDeleted: remove group
    const handleGroupDeleted = ({ _id }) => {
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== _id),
        selectedGroup:
          state.selectedGroup && state.selectedGroup._id === _id
            ? null
            : state.selectedGroup,
      }));
    };
    socket.on("groupUpdate", handleGroupUpdate);
    socket.on("groupDeleted", handleGroupDeleted);
  },
  setupReactionSocketListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    const handleReactionUpdate = (updatedMessage) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(updatedMessage._id) ? updatedMessage : m
        ),
        groupMessages: state.groupMessages.map((m) =>
          String(m._id) === String(updatedMessage._id) ? updatedMessage : m
        ),
      }));
    };
    socket.on("reactionUpdate", handleReactionUpdate);
  },
}));
