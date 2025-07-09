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

  subscribeToMessages: async (userId) => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      set({ messages: [...get().messages, newMessage] });
    });
    socket.on("reactionUpdate", (updatedMessage) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(updatedMessage._id) ? updatedMessage : m
        ),
      }));
    });
    socket.on("readReceiptUpdate", (updatedMessage) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(updatedMessage._id) ? updatedMessage : m
        ),
      }));
    });
  },

  unSubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("reactionUpdate");
    socket.off("readReceiptUpdate");
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

  subscribeToGroupMessages: (groupId) => {
    const socket = useAuthStore.getState().socket;
    socket.emit("joinGroup", groupId);
    socket.on("newGroupMessage", (newMessage) => {
      if (newMessage.groupId !== groupId) return;
      set({ groupMessages: [...get().groupMessages, newMessage] });
    });
    socket.on("reactionUpdate", (updatedMessage) => {
      set((state) => ({
        groupMessages: state.groupMessages.map((m) =>
          String(m._id) === String(updatedMessage._id) ? updatedMessage : m
        ),
      }));
    });
    socket.on("readReceiptUpdate", (updatedMessage) => {
      set((state) => ({
        groupMessages: state.groupMessages.map((m) =>
          String(m._id) === String(updatedMessage._id) ? updatedMessage : m
        ),
      }));
    });
  },

  unSubscribeToGroupMessages: (groupId) => {
    const socket = useAuthStore.getState().socket;
    socket.emit("leaveGroup", groupId);
    socket.off("newGroupMessage");
    socket.off("reactionUpdate");
    socket.off("readReceiptUpdate");
  },

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
    const socket = useAuthStore.getState().socket;
    try {
      const res = await axiosInstance.post(`/messages/${messageId}/reactions`, {
        emoji,
      });
      // Optimistically update state
      if (isGroup) {
        set((state) => ({
          groupMessages: state.groupMessages.map((m) =>
            m._id === messageId ? res.data : m
          ),
        }));
        socket.emit("addReaction", { message: res.data, groupId });
      } else {
        set((state) => ({
          messages: state.messages.map((m) =>
            m._id === messageId ? res.data : m
          ),
        }));
        socket.emit("addReaction", { message: res.data, receiverId });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Remove the stale message from state, do not show a toast
        if (isGroup) {
          set((state) => ({
            groupMessages: state.groupMessages.filter(
              (m) => m._id !== messageId
            ),
          }));
        } else {
          set((state) => ({
            messages: state.messages.filter((m) => m._id !== messageId),
          }));
        }
      } else {
        toast.error(error.response?.data?.message || "Error adding reaction");
      }
    }
  },
  removeReaction: async (messageId, isGroup, groupId, receiverId) => {
    const socket = useAuthStore.getState().socket;
    try {
      const res = await axiosInstance.delete(
        `/messages/${messageId}/reactions`
      );
      if (isGroup) {
        set((state) => ({
          groupMessages: state.groupMessages.map((m) =>
            m._id === messageId ? res.data : m
          ),
        }));
        socket.emit("removeReaction", { message: res.data, groupId });
      } else {
        set((state) => ({
          messages: state.messages.map((m) =>
            m._id === messageId ? res.data : m
          ),
        }));
        socket.emit("removeReaction", { message: res.data, receiverId });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Remove the stale message from state, do not show a toast
        if (isGroup) {
          set((state) => ({
            groupMessages: state.groupMessages.filter(
              (m) => m._id !== messageId
            ),
          }));
        } else {
          set((state) => ({
            messages: state.messages.filter((m) => m._id !== messageId),
          }));
        }
      } else {
        toast.error(error.response?.data?.message || "Error removing reaction");
      }
    }
  },
  markAsRead: async (messageId, isGroup, groupId, receiverId) => {
    const socket = useAuthStore.getState().socket;
    try {
      const res = await axiosInstance.post(`/messages/${messageId}/read`);
      if (isGroup) {
        set((state) => ({
          groupMessages: state.groupMessages.map((m) =>
            m._id === messageId ? res.data : m
          ),
        }));
        socket.emit("readReceipt", { message: res.data, groupId });
      } else {
        set((state) => ({
          messages: state.messages.map((m) =>
            m._id === messageId ? res.data : m
          ),
        }));
        socket.emit("readReceipt", { message: res.data, receiverId });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Do NOT remove the message from state on 404
      } else {
        console.error("[markAsRead] Error:", error);
        toast.error(error.response?.data?.message || "Error marking as read");
      }
    }
  },
}));
