import { X, Users2, UserPlus, UserMinus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

const ChatHeader = ({ isGroup }) => {
  const { selectedUser, setSelectedUser, selectedGroup, setSelectedGroup, users, addGroupMember, removeGroupMember } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [addUserId, setAddUserId] = useState("");

  if (isGroup && selectedGroup) {
    // Get member user objects for avatars
    const groupMembers = users.filter(u => selectedGroup.members.includes(u._id) || u._id === authUser._id);
    const isAdmin = selectedGroup.admins.includes(authUser._id);
    const availableToAdd = users.filter(u => !selectedGroup.members.includes(u._id) && u._id !== authUser._id);
    return (
      <>
        <div className="p-2.5 border-b border-base-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="size-10 rounded-full bg-base-300 flex items-center justify-center">
                  <Users2 className="size-6 text-base-content/70" />
                </div>
              </div>
              <div>
                <h3 className="font-medium">{selectedGroup.name}</h3>
                <p className="text-sm text-base-content/70">
                  {selectedGroup.members.length} members
                </p>
                <div className="flex -space-x-2 mt-1">
                  {groupMembers.slice(0, 5).map(member => (
                    <img
                      key={member._id}
                      src={member.profilePic || "/avatar.png"}
                      alt={member.fullName}
                      className="size-6 rounded-full border-2 border-base-100"
                      title={member.fullName}
                    />
                  ))}
                  {selectedGroup.members.length + 1 > 5 && (
                    <span className="size-6 rounded-full bg-base-200 flex items-center justify-center text-xs border-2 border-base-100">+{selectedGroup.members.length - 5}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-xs btn-ghost" onClick={() => setShowMembersModal(true)}>
                <Users2 size={18} /> <span className="hidden lg:inline ml-1">View Members</span>
              </button>
              <button onClick={() => setSelectedGroup(null)}>
                <X />
              </button>
            </div>
          </div>
        </div>
        {/* Group Members Modal */}
        {showMembersModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Group Members</h2>
              <div className="max-h-60 overflow-y-auto divide-y divide-base-200 mb-4">
                {groupMembers.map(member => (
                  <div key={member._id} className="flex items-center gap-3 py-2">
                    <img src={member.profilePic || "/avatar.png"} alt={member.fullName} className="size-8 rounded-full" />
                    <span className="font-medium flex-1">{member.fullName} {member._id === authUser._id && <span className="text-xs text-primary">(You)</span>}</span>
                    {isAdmin && member._id !== authUser._id && (
                      <button className="btn btn-xs btn-circle btn-error" title="Remove Member" onClick={() => removeGroupMember(selectedGroup._id, member._id)}>
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isAdmin && availableToAdd.length > 0 && (
                <form className="flex items-center gap-2 mb-4" onSubmit={e => { e.preventDefault(); if(addUserId) { addGroupMember(selectedGroup._id, addUserId); setAddUserId(""); } }}>
                  <select className="select select-sm w-full" value={addUserId} onChange={e => setAddUserId(e.target.value)}>
                    <option value="">Select user to add</option>
                    {availableToAdd.map(u => (
                      <option key={u._id} value={u._id}>{u.fullName}</option>
                    ))}
                  </select>
                  <button type="submit" className="btn btn-sm btn-primary flex items-center gap-1" disabled={!addUserId}>
                    <UserPlus size={16} /> Add
                  </button>
                </form>
              )}
              <div className="flex justify-end gap-2">
                <button className="btn btn-sm" onClick={() => setShowMembersModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Private chat fallback
  if (selectedUser) {
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
  }
  return null;
};
export default ChatHeader;