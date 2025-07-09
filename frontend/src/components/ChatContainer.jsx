import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, isValidObjectId } from "../lib/utils";

const EMOJI_OPTIONS = ["👍", "😂", "❤️", "😮", "😢", "🔥"];

const ReactionBar = ({ message, isMe, groupedReactions, myReaction, onReact, onRemove, onOpenPicker, showPicker, onClosePicker }) => {
  const [showTooltip, setShowTooltip] = useState(null);
  return (
    <div
      className={`flex flex-row items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}
      style={{ position: 'relative', maxWidth: '90vw' }}
      onMouseLeave={() => setShowTooltip(null)}
    >
      {Object.entries(groupedReactions).map(([emoji, names]) => (
        <span
          key={emoji}
          className={`bg-base-200 rounded-full px-2 py-0.5 text-sm cursor-pointer hover:bg-base-300 transition relative`}
          onMouseEnter={() => setShowTooltip(emoji)}
          onClick={() => myReaction && myReaction.emoji === emoji ? onRemove() : onReact(emoji)}
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          {emoji} <span className="text-xs">{names.length}</span>
          {showTooltip === emoji && (
            <span
              className={`absolute z-50 bg-base-100 border border-base-300 rounded px-2 py-1 text-xs mt-7 shadow-lg whitespace-nowrap ${isMe ? 'right-0 left-auto' : 'left-1/2 -translate-x-1/2'}`}
              style={isMe ? { right: 0, left: 'auto' } : { left: '50%', transform: 'translateX(-50%)' }}
            >
              {names.join(", ")}
            </span>
          )}
        </span>
      ))}
      {/* Add reaction button */}
      <div className="relative" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <button
          className="ml-1 px-1 text-lg rounded-full hover:bg-base-300 transition"
          onClick={onOpenPicker}
          tabIndex={0}
        >
          ＋
        </button>
        {showPicker && (
          <div
            className={`absolute z-50 bg-base-100 border border-base-300 rounded p-2 flex flex-row gap-1 mt-2 shadow-lg whitespace-nowrap ${isMe ? 'right-0 left-auto' : 'left-1/2 -translate-x-1/2'}`}
            style={isMe ? { right: 0, left: 'auto', maxWidth: '80vw' } : { left: '50%', transform: 'translateX(-50%)', maxWidth: '80vw' }}
          >
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                className="text-xl p-1 hover:bg-base-200 rounded"
                onClick={() => { onReact(emoji); onClosePicker(); }}
                tabIndex={0}
              >{emoji}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatContainer = () => {
  const {
    messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unSubscribeToMessages,
    groupMessages, getGroupMessages, isGroupMessagesLoading, selectedGroup, subscribeToGroupMessages, unSubscribeToGroupMessages,
    users, addReaction, removeReaction, markAsRead
  } = useChatStore();
  const {authUser} = useAuthStore();
  const messageEndRef = useRef(null);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [pickerOpenMsg, setPickerOpenMsg] = useState(null);

  // --- Robust race condition fix ---
  // Track the current chat/group version
  const chatVersionRef = useRef(0);
  const lastUserIdRef = useRef(null);
  const lastGroupIdRef = useRef(null);

  // Track last fetched user/group to avoid redundant fetches
  const lastFetchedUserId = useRef(null);
  const lastFetchedGroupId = useRef(null);

  // Increment version on chat/group switch
  useEffect(() => {
    if (selectedUser) {
      chatVersionRef.current += 1;
      lastUserIdRef.current = selectedUser._id;
      lastGroupIdRef.current = null;
    } else if (selectedGroup) {
      chatVersionRef.current += 1;
      lastGroupIdRef.current = selectedGroup._id;
      lastUserIdRef.current = null;
    } else {
      chatVersionRef.current += 1;
      lastUserIdRef.current = null;
      lastGroupIdRef.current = null;
    }
  }, [selectedUser, selectedGroup]);

  // Private chat effect: only fetch on user change
  useEffect(() => {
    if (selectedUser && lastFetchedUserId.current !== selectedUser._id) {
      getMessages(selectedUser._id);
      subscribeToMessages(selectedUser._id);
      lastFetchedUserId.current = selectedUser._id;
      lastFetchedGroupId.current = null;
      return () => unSubscribeToMessages();
    }
  }, [getMessages, selectedUser, subscribeToMessages, unSubscribeToMessages]);

  // Group chat effect: only fetch on group change
  useEffect(() => {
    if (selectedGroup && lastFetchedGroupId.current !== selectedGroup._id) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages(selectedGroup._id);
      lastFetchedGroupId.current = selectedGroup._id;
      lastFetchedUserId.current = null;
      return () => unSubscribeToGroupMessages(selectedGroup._id);
    }
  }, [getGroupMessages, selectedGroup, subscribeToGroupMessages, unSubscribeToGroupMessages]);

  useEffect(()=>{
    if(messageEndRef.current && (selectedUser ? messages : groupMessages))
      messageEndRef.current.scrollIntoView({behavior:"smooth"});
  },[messages, groupMessages, selectedUser, selectedGroup]);

  // Unified markAsRead effect for both private and group chats
  useEffect(() => {
    const currentVersion = chatVersionRef.current;
    // Only run for the latest version and current selection
    if (selectedGroup && !isGroupMessagesLoading && Array.isArray(groupMessages) && groupMessages.length > 0 && lastGroupIdRef.current === selectedGroup._id) {
      groupMessages.forEach(m => {
        if (chatVersionRef.current !== currentVersion) return;
        if (m && m._id && isValidObjectId(m._id) && Array.isArray(m.readBy) && !m.readBy.includes(authUser._id)) {
          markAsRead(m._id, true, selectedGroup._id);
        }
      });
    } else if (selectedUser && !isMessagesLoading && Array.isArray(messages) && messages.length > 0 && lastUserIdRef.current === selectedUser._id) {
      messages.forEach(m => {
        if (chatVersionRef.current !== currentVersion) return;
        if (m && m._id && isValidObjectId(m._id) && Array.isArray(m.readBy) && !m.readBy.includes(authUser._id)) {
          markAsRead(m._id, false, null, selectedUser._id);
        }
      });
    }
    // eslint-disable-next-line
  }, [groupMessages, messages, selectedGroup, selectedUser, isMessagesLoading, isGroupMessagesLoading, authUser._id]);

  // Helper to get user info
  const getUser = (userId) => {
    if (userId === authUser._id) return authUser;
    return users.find(u => u._id === userId) || { fullName: userId, profilePic: "/avatar.png" };
  };

  // Loading states
  if (selectedGroup && isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader isGroup />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  if (selectedUser && isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // No chat selected
  if (!selectedUser && !selectedGroup) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400">Select a chat or group to start messaging</div>;
  }

  // Group chat UI
  if (selectedGroup) {
    // Find last message for read receipts
    const lastMsg = groupMessages[groupMessages.length - 1];
    const isLastMine = lastMsg && lastMsg.senderId === authUser._id;
    const seenBy = lastMsg?.readBy?.filter(id => id !== lastMsg.senderId) || [];
    console.log('[ChatContainer] Rendering groupMessages:', groupMessages);
    console.log('[ChatContainer] selectedGroup:', selectedGroup);
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader isGroup />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {groupMessages.map((message, idx) => {
            const isMe = message.senderId === authUser._id;
            const sender = getUser(message.senderId);
            // Reaction logic
            const myReaction = message.reactions?.find(r => r.userId === authUser._id);
            const groupedReactions = {};
            (message.reactions || []).forEach(r => {
              if (!groupedReactions[r.emoji]) groupedReactions[r.emoji] = [];
              groupedReactions[r.emoji].push(getUser(r.userId).fullName);
            });
            const isLast = idx === groupMessages.length - 1;
            const showReactions = hoveredMsg === message._id || (message.reactions && message.reactions.length > 0);
            return (
              <div
                key={message._id}
                className={`flex flex-col items-${isMe ? "end" : "start"}`}
                onMouseEnter={() => setHoveredMsg(message._id)}
                onMouseLeave={() => { setHoveredMsg(null); setPickerOpenMsg(null); }}
                tabIndex={0}
              >
                <div
                  className={`chat-bubble flex flex-col relative max-w-[80vw] sm:max-w-md px-4 py-2 rounded-2xl shadow-md mb-1 transition-colors duration-150 ${isMe ? "bg-primary text-primary-content self-end" : "bg-base-200 text-base-content self-start"} ${hoveredMsg === message._id ? "ring-2 ring-primary/30" : ""}`}
                  style={{ borderBottomRightRadius: isMe ? 6 : 24, borderBottomLeftRadius: isMe ? 24 : 6 }}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                  <span className="text-xs text-zinc-400 mt-1 self-end flex items-center gap-1">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
                {/* Reactions bar: always visible if reactions, or on hover */}
                {showReactions && (
                  <div className="mt-1">
                    <ReactionBar
                      message={message}
                      isMe={isMe}
                      groupedReactions={groupedReactions}
                      myReaction={myReaction}
                      onReact={emoji => message._id && isValidObjectId(message._id) && addReaction(message._id, emoji, true, selectedGroup._id)}
                      onRemove={() => message._id && isValidObjectId(message._id) && removeReaction(message._id, true, selectedGroup._id)}
                      onOpenPicker={() => setPickerOpenMsg(message._id)}
                      showPicker={pickerOpenMsg === message._id}
                      onClosePicker={() => setPickerOpenMsg(null)}
                    />
                  </div>
                )}
                {isMe && isLast && (
                  <div className="text-xs text-zinc-400 mt-0.5 mr-2 flex items-center gap-1">
                    {seenBy.length > 0 ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 18 18" className="inline-block text-blue-500"><path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                        <svg width="16" height="16" viewBox="0 0 18 18" className="-ml-2 inline-block text-blue-500"><path d="M7 11l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                        <span>Seen by {seenBy.length}</span>
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 18 18" className="inline-block text-zinc-400"><path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                        <span>Delivered</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <MessageInput />
      </div>
    );
  }

  // Private chat UI
  if (selectedUser) {
    // Find last message for read receipts
    const lastMsg = messages[messages.length - 1];
    const isLastMine = lastMsg && lastMsg.senderId === authUser._id;
    const seen = lastMsg?.readBy?.includes(selectedUser._id);
    console.log('[ChatContainer] Rendering messages:', messages);
    console.log('[ChatContainer] selectedUser:', selectedUser);
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, idx) => {
            const isMe = message.senderId === authUser._id;
            const sender = getUser(message.senderId);
            // Reaction logic
            const myReaction = message.reactions?.find(r => r.userId === authUser._id);
            const groupedReactions = {};
            (message.reactions || []).forEach(r => {
              if (!groupedReactions[r.emoji]) groupedReactions[r.emoji] = [];
              groupedReactions[r.emoji].push(getUser(r.userId).fullName);
            });
            const isLast = idx === messages.length - 1;
            const showReactions = hoveredMsg === message._id || (message.reactions && message.reactions.length > 0);
            return (
              <div
                key={message._id}
                className={`flex flex-col items-${isMe ? "end" : "start"}`}
                onMouseEnter={() => setHoveredMsg(message._id)}
                onMouseLeave={() => { setHoveredMsg(null); setPickerOpenMsg(null); }}
                tabIndex={0}
              >
                <div
                  className={`chat-bubble flex flex-col relative max-w-[80vw] sm:max-w-md px-4 py-2 rounded-2xl shadow-md mb-1 transition-colors duration-150 ${isMe ? "bg-primary text-primary-content self-end" : "bg-base-200 text-base-content self-start"} ${hoveredMsg === message._id ? "ring-2 ring-primary/30" : ""}`}
                  style={{ borderBottomRightRadius: isMe ? 6 : 24, borderBottomLeftRadius: isMe ? 24 : 6 }}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                  <span className="text-xs text-zinc-400 mt-1 self-end flex items-center gap-1">
                    {formatMessageTime(message.createdAt)}
                    {isMe && isLast && (
                      <span className="ml-1 flex items-center">
                        {seen ? (
                          <>
                            <svg width="18" height="18" viewBox="0 0 18 18" className="inline-block text-blue-500"><path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                            <svg width="18" height="18" viewBox="0 0 18 18" className="-ml-2 inline-block text-blue-500"><path d="M7 11l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                          </>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 18 18" className="inline-block text-zinc-400"><path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                        )}
                      </span>
                    )}
                  </span>
                </div>
                {/* Reactions bar: always visible if reactions, or on hover */}
                {showReactions && (
                  <div className="mt-1">
                    <ReactionBar
                      message={message}
                      isMe={isMe}
                      groupedReactions={groupedReactions}
                      myReaction={myReaction}
                      onReact={emoji => message._id && isValidObjectId(message._id) && addReaction(message._id, emoji, false, null, selectedUser._id)}
                      onRemove={() => message._id && isValidObjectId(message._id) && removeReaction(message._id, false, null, selectedUser._id)}
                      onOpenPicker={() => setPickerOpenMsg(message._id)}
                      showPicker={pickerOpenMsg === message._id}
                      onClosePicker={() => setPickerOpenMsg(null)}
                    />
                  </div>
                )}
                {isMe && isLast && (
                  <div className="text-xs text-zinc-400 mt-0.5 mr-2 flex items-center gap-1">
                    {seen ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 18 18" className="inline-block text-blue-500"><path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                        <svg width="16" height="16" viewBox="0 0 18 18" className="-ml-2 inline-block text-blue-500"><path d="M7 11l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                        <span>Seen</span>
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 18 18" className="inline-block text-zinc-400"><path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                        <span>Delivered</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <MessageInput />
      </div>
    );
  }

  return null;
}

export default ChatContainer;