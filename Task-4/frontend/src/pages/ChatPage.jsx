import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import UserProfile from '../components/UserProfile';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeChat, setActiveChat] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Socket notification listener for background chats
  useEffect(() => {
    if (!socket) return;

    const handleBackgroundMessage = (msg) => {
      // If no active chat, or message is from another chat
      if (!activeChat || activeChat._id !== msg.chat._id) {
        setNotifications((prev) => [...prev, msg]);
        toast(`📩 @${msg.sender.username}: ${msg.content || 'Sent an attachment'}`, {
          icon: '💬',
          style: {
            background: '#1e1b4b',
            color: '#c084fc',
            border: '1px solid #818cf8'
          }
        });
      }
    };

    socket.on('messageReceived', handleBackgroundMessage);

    return () => {
      socket.off('messageReceived', handleBackgroundMessage);
    };
  }, [socket, activeChat]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    // Clear notifications for this chat
    setNotifications((prev) => prev.filter((n) => n.chat._id !== chat._id));
  };

  const clearNotification = (chatId) => {
    setNotifications((prev) => prev.filter((n) => n.chat._id !== chatId));
  };

  const handleNewMessageSent = (msg) => {
    // Clear notifications (if any exist for some reason)
    clearNotification(msg.chat._id);
  };

  return (
    <div className="chat-page-container">
      <Sidebar
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onProfileOpen={() => setShowProfile(true)}
        notifications={notifications}
        clearNotification={clearNotification}
      />

      {activeChat ? (
        <ChatArea
          chat={activeChat}
          onNewMessageSent={handleNewMessageSent}
        />
      ) : (
        <div className="welcome-chat-panel">
          <div className="welcome-inner">
            <span className="welcome-bubble">💬</span>
            <h1>Welcome to LocalChat!</h1>
            <p>Select a chat from the sidebar or search a user to start messaging instantly.</p>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="profile-drawer-overlay">
          <UserProfile onClose={() => setShowProfile(false)} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
