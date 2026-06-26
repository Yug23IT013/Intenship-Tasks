import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getMessages, sendMessage } from '../api/api';
import toast from 'react-hot-toast';
import { FiSend, FiPaperclip, FiX, FiFileText, FiImage, FiSmile } from 'react-icons/fi';

const PRESET_FILES = [
  { name: 'localchat_architecture.png', type: 'image', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop' },
  { name: 'mock_weekly_report.pdf', type: 'file', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { name: 'avatar_options.zip', type: 'file', url: '#' }
];

const ChatArea = ({ chat, onNewMessageSent }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachment, setAttachment] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load chat history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!chat) return;
      setLoading(true);
      try {
        const res = await getMessages(chat._id);
        setMessages(res.data.data);
        // Connect socket room
        if (socket) {
          socket.emit('joinChat', chat._id);
        }
      } catch {
        toast.error('Failed to load message history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    setAttachment(null);
    setShowAttachMenu(false);
  }, [chat, socket]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Socket listener for new messages & typing in active chat
  useEffect(() => {
    if (!socket || !chat) return;

    const handleMessageReceived = (msg) => {
      // Check if message belongs to current chat
      if (msg.chat._id === chat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = (roomId) => {
      if (roomId === chat._id) setIsTyping(true);
    };

    const handleStopTyping = (roomId) => {
      if (roomId === chat._id) setIsTyping(false);
    };

    socket.on('messageReceived', handleMessageReceived);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('messageReceived', handleMessageReceived);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket, chat]);

  // Typing emitter handler
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !chat) return;

    socket.emit('typing', chat._id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', chat._id);
    }, 2000);
  };

  // Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    if (socket && chat) {
      socket.emit('stopTyping', chat._id);
    }

    try {
      const payload = {
        chatId: chat._id,
        content: newMessage.trim(),
        fileUrl: attachment?.url || '',
        fileType: attachment?.type || '',
        fileName: attachment?.name || ''
      };

      const res = await sendMessage(payload);
      
      // Update local message list
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
      setAttachment(null);

      // Emit to server
      if (socket) {
        socket.emit('newMessage', res.data.data);
      }

      onNewMessageSent(res.data.data);
    } catch {
      toast.error('Message could not be sent');
    }
  };

  // Get partner details for header status
  const getPartnerDetails = () => {
    if (chat && !chat.isGroupChat) {
      return chat.members.find((m) => m._id !== user._id) || { username: 'user', avatar: '', status: 'offline', lastSeen: '' };
    }
    return null;
  };

  const partner = getPartnerDetails();

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-header">
        {chat.isGroupChat ? (
          <div className="chat-header-details">
            <div className="avatar-wrap">
              <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${chat._id}`} alt="Group" />
            </div>
            <div>
              <h3>{chat.name}</h3>
              <p className="sub">{chat.members?.length} members: {chat.members?.map((m) => `@${m.username}`).join(', ')}</p>
            </div>
          </div>
        ) : (
          <div className="chat-header-details">
            <div className="avatar-wrap">
              <img src={partner?.avatar} alt={partner?.username} />
              <span className={`presence-dot ${onlineUsers[partner?._id] || partner?.status || 'offline'}`} />
            </div>
            <div>
              <h3>@{partner?.username}</h3>
              <p className="sub">
                {onlineUsers[partner?._id] === 'online' || partner?.status === 'online' ? (
                  <span className="online-label">Active now</span>
                ) : onlineUsers[partner?._id] === 'away' || partner?.status === 'away' ? (
                  <span className="away-label">Away</span>
                ) : (
                  <span>
                    Offline {partner?.lastSeen ? `· Last seen ${new Date(partner.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message List */}
      <div className="messages-container">
        {loading ? (
          <div className="chat-loading"><p>Retrieving history...</p></div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <span className="wave-icon">👋</span>
            <p>Say hello to start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((m) => {
              const isMine = m.sender._id === user._id;
              return (
                <div key={m._id} className={`message-row ${isMine ? 'mine' : 'other'}`}>
                  {!isMine && <img src={m.sender.avatar} alt="Avatar" className="msg-sender-avatar" />}
                  <div className="message-content-wrapper">
                    {!isMine && <span className="msg-sender-name">@{m.sender.username}</span>}
                    <div className="message-bubble">
                      {/* Multimedia Attachments */}
                      {m.fileUrl && m.fileType === 'image' && (
                        <div className="msg-image-attachment">
                          <img src={m.fileUrl} alt={m.fileName} />
                        </div>
                      )}
                      {m.fileUrl && m.fileType === 'file' && (
                        <div className="msg-file-attachment">
                          <FiFileText className="file-icon" />
                          <div>
                            <span className="file-name">{m.fileName}</span>
                            <a href={m.fileUrl} target="_blank" rel="noreferrer" className="file-link">Download</a>
                          </div>
                        </div>
                      )}
                      {m.content && <p className="msg-text">{m.content}</p>}
                    </div>
                    <span className="msg-time">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Typing status */}
            {isTyping && (
              <div className="message-row other typing-bubble-row">
                {!chat.isGroupChat && <img src={partner?.avatar} alt="Avatar" className="msg-sender-avatar" />}
                <div className="typing-bubble">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Selected Attachment Preview Banner */}
      {attachment && (
        <div className="attachment-preview-banner">
          <div className="preview-info">
            {attachment.type === 'image' ? <FiImage /> : <FiFileText />}
            <span>Selected attachment: <strong>{attachment.name}</strong></span>
          </div>
          <button className="btn-icon" onClick={() => setAttachment(null)} title="Remove attachment">
            <FiX />
          </button>
        </div>
      )}

      {/* Input panel */}
      <form onSubmit={handleSend} className="chat-input-panel" id="chat-input-form">
        <div className="input-actions-wrap">
          <button
            type="button"
            className={`btn-icon ${showAttachMenu ? 'active' : ''}`}
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            id="attach-btn"
            title="Attach Mock Media"
          >
            <FiPaperclip />
          </button>

          {showAttachMenu && (
            <div className="attach-popover">
              <h4>Attach File (Mock Share)</h4>
              <ul>
                {PRESET_FILES.map((file, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setAttachment(file);
                      setShowAttachMenu(false);
                    }}
                  >
                    {file.type === 'image' ? <FiImage /> : <FiFileText />}
                    <span>{file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <input
          id="message-input"
          type="text"
          placeholder={attachment ? 'Add comment to attachment...' : 'Type a message...'}
          value={newMessage}
          onChange={handleInputChange}
          autoComplete="off"
        />

        <button type="submit" className="btn-send" id="send-btn" disabled={!newMessage.trim() && !attachment}>
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
