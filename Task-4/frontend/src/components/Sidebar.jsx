import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { searchUsers, createChat, createGroupChat, getChats } from '../api/api';
import toast from 'react-hot-toast';
import { FiLogOut, FiUser, FiSearch, FiPlus, FiX } from 'react-icons/fi';

const Sidebar = ({ activeChat, onSelectChat, onProfileOpen, notifications, clearNotification }) => {
  const { user, handleLogout } = useAuth();
  const { onlineUsers } = useSocket();
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Load chats on mount and when activeChat changes
  const loadChats = async () => {
    try {
      const res = await getChats();
      setChats(res.data.data);
    } catch (err) {
      toast.error('Failed to load chats');
    }
  };

  useEffect(() => {
    loadChats();
  }, [activeChat, notifications]);

  // Handle User Search
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearch(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchUsers(query);
      setSearchResults(res.data.data);
    } catch {
      console.error('Error searching users');
    }
  };

  const handleStartChat = async (partnerId) => {
    try {
      const res = await createChat(partnerId);
      onSelectChat(res.data.data);
      setSearch('');
      setSearchResults([]);
    } catch (err) {
      toast.error('Could not open chat');
    }
  };

  // Group Modal Setup - Load all users
  const openGroupModal = async () => {
    setShowGroupModal(true);
    try {
      const res = await searchUsers('');
      setAllUsers(res.data.data);
    } catch {
      toast.error('Failed to fetch users list');
    }
  };

  const handleToggleMember = (userId) => {
    setSelectedGroupMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedGroupMembers.length < 1) {
      toast.error('Please enter a group name and select at least 1 member');
      return;
    }
    try {
      const payload = {
        name: groupName,
        users: JSON.stringify(selectedGroupMembers)
      };
      const res = await createGroupChat(payload);
      onSelectChat(res.data.data);
      setGroupName('');
      setSelectedGroupMembers([]);
      setShowGroupModal(false);
      toast.success('Group created successfully!');
    } catch {
      toast.error('Failed to create group');
    }
  };

  // Get partner details for 1-on-1 chats
  const getPartnerDetails = (chat) => {
    if (!chat.isGroupChat) {
      return chat.members.find((m) => m._id !== user._id) || { username: 'Unknown User', avatar: '', status: 'offline' };
    }
    return null;
  };

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="user-profile-summary" onClick={onProfileOpen} id="profile-summary">
          <div className="avatar-wrap">
            <img src={user?.avatar} alt="Avatar" className="user-avatar" />
            <span className={`presence-dot ${onlineUsers[user?._id] || user?.status || 'offline'}`} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
            <span className="user-status-text">
              {onlineUsers[user?._id] || user?.status || 'offline'}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={onProfileOpen} title="Edit Profile" id="edit-profile-btn">
            <FiUser />
          </button>
          <button className="btn-icon btn-logout" onClick={handleLogout} title="Log Out" id="logout-btn">
            <FiLogOut />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-wrap">
        <div className="search-input-box">
          <FiSearch className="search-icon" />
          <input
            id="user-search-input"
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Search Results Drawer */}
      {search.trim() && (
        <div className="search-results">
          <h3>Users Found</h3>
          {searchResults.length === 0 ? (
            <p className="no-results">No users match "{search}"</p>
          ) : (
            <ul className="results-list">
              {searchResults.map((u) => (
                <li key={u._id} onClick={() => handleStartChat(u._id)} className="search-result-item">
                  <div className="avatar-wrap">
                    <img src={u.avatar} alt={u.username} />
                    <span className={`presence-dot ${onlineUsers[u._id] || u.status || 'offline'}`} />
                  </div>
                  <span>@{u.username}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Chat List */}
      <div className="chats-list-container">
        <div className="list-title-row">
          <h3>Recent Conversations</h3>
          <button className="btn-action" onClick={openGroupModal} id="new-group-btn" title="New Group Chat">
            <FiPlus /> New Group
          </button>
        </div>

        <div className="chats-list">
          {chats.length === 0 ? (
            <div className="empty-chats">
              <p>No recent chats.</p>
              <p className="hint">Search a username above to start a conversation!</p>
            </div>
          ) : (
            chats.map((c) => {
              const partner = getPartnerDetails(c);
              const isSelected = activeChat?._id === c._id;
              const hasNotification = notifications.some((n) => n.chat._id === c._id);
              const notifCount = notifications.filter((n) => n.chat._id === c._id).length;

              return (
                <div
                  key={c._id}
                  className={`chat-item-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectChat(c);
                    if (hasNotification) clearNotification(c._id);
                  }}
                >
                  <div className="avatar-wrap">
                    <img src={c.isGroupChat ? `https://api.dicebear.com/7.x/identicon/svg?seed=${c._id}` : partner.avatar} alt="Chat" />
                    {!c.isGroupChat && (
                      <span className={`presence-dot ${onlineUsers[partner._id] || partner.status || 'offline'}`} />
                    )}
                  </div>

                  <div className="chat-item-info">
                    <div className="chat-item-header">
                      <span className="chat-name">
                        {c.isGroupChat ? c.name : `@${partner.username}`}
                      </span>
                      {c.latestMessage && (
                        <span className="chat-time">
                          {new Date(c.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="chat-item-body">
                      <p className="latest-msg-text">
                        {c.latestMessage ? (
                          <>
                            <strong>{c.latestMessage.sender.username === user.username ? 'You: ' : ''}</strong>
                            {c.latestMessage.content || 'Sent an attachment'}
                          </>
                        ) : (
                          <span className="no-msg">No messages yet</span>
                        )}
                      </p>
                      {hasNotification && (
                        <span className="unread-badge">{notifCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Group Creation Modal */}
      {showGroupModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Create Group Room</h2>
              <button className="btn-icon" onClick={() => setShowGroupModal(false)} aria-label="Close modal">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} id="group-form">
              <div className="form-group">
                <label htmlFor="group-name">Group / Room Name *</label>
                <input
                  id="group-name"
                  type="text"
                  placeholder="e.g. Project Discussion, Foodies..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Members *</label>
                <div className="members-select-list">
                  {allUsers.length === 0 ? (
                    <p className="no-members-hint">No other registered users found.</p>
                  ) : (
                    allUsers.map((u) => {
                      const isSelected = selectedGroupMembers.includes(u._id);
                      return (
                        <label key={u._id} className={`member-label ${isSelected ? 'selected' : ''}`} htmlFor={`member-${u._id}`}>
                          <input
                            id={`member-${u._id}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleMember(u._id)}
                          />
                          <img src={u.avatar} alt={u.username} className="member-check-avatar" />
                          <span>@{u.username}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowGroupModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" id="submit-group-btn" disabled={selectedGroupMembers.length < 1}>
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
