import React, { useEffect, useState, useRef } from 'react'
import { useChatStore } from '../store/useChatStore';
import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { Users, Users2, Plus } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = () => {
    const {
      getUsers, users, selectedUser, setSelectedUser, isUsersLoading,
      getGroups, groups, selectedGroup, setSelectedGroup, isGroupsLoading, createGroup
    } = useChatStore();
    const {onlineUsers, authUser} = useAuthStore();

    const [showOnlineOnly,setShowOnlineOnly] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const formRef = useRef();

    useEffect(()=>{
        getUsers();
        getGroups();
    },[getUsers, getGroups]);

    const filteredUsers = showOnlineOnly ? users.filter((user) => onlineUsers.includes(user._id)) : users;
    if(isUsersLoading || isGroupsLoading) return <SidebarSkeleton/>;

    const handleMemberToggle = (userId) => {
      setSelectedMembers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    };

    const handleCreateGroup = async (e) => {
      e.preventDefault();
      if (!groupName.trim() || selectedMembers.length === 0) return;
      setIsCreating(true);
      await createGroup(groupName.trim(), selectedMembers);
      setIsCreating(false);
      setShowGroupModal(false);
      setGroupName("");
      setSelectedMembers([]);
      if (formRef.current) formRef.current.reset();
    };

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
        <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      {/* Group List */}
      <div className="border-b border-base-300 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users2 className="size-5" />
            <span className="font-medium text-sm hidden lg:block">Groups</span>
          </div>
          <button
            className="btn btn-xs btn-circle btn-ghost"
            title="Create Group"
            onClick={() => setShowGroupModal(true)}
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {groups.length === 0 && <span className="text-xs text-zinc-500">No groups</span>}
          {groups.map((group) => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-base-300 transition-colors ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
            >
              <span className="font-medium truncate">{group.name}</span>
              <span className="ml-auto text-xs text-zinc-400">{group.members.length} members</span>
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={
              `w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`
            }
            disabled={authUser && user._id === authUser._id}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
      {/* Group creation modal placeholder */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create Group</h2>
            <form ref={formRef} onSubmit={handleCreateGroup}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Select Members</label>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {users.filter(u => u._id !== authUser._id).map(user => (
                    <label key={user._id} className="flex items-center gap-2 mb-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user._id)}
                        onChange={() => handleMemberToggle(user._id)}
                        className="checkbox checkbox-xs"
                      />
                      <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="size-6 rounded-full" />
                      <span className="text-sm">{user.fullName}</span>
                    </label>
                  ))}
                  {users.filter(u => u._id !== authUser._id).length === 0 && (
                    <span className="text-xs text-zinc-400">No other users available</span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-sm" onClick={() => setShowGroupModal(false)} disabled={isCreating}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary" disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}>
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;