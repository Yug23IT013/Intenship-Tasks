import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationsRead } from '../api/api';
import toast from 'react-hot-toast';
import { FiX, FiCheck, FiHeart, FiMessageSquare, FiUserPlus } from 'react-icons/fi';

const NotificationCenter = ({ onClose, onMarkRead }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data.data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
      if (onMarkRead) onMarkRead();
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  const handleNotificationClick = (n) => {
    onClose();
    if (n.type === 'follow') {
      navigate(`/profile/${n.sender._id}`);
    } else if (n.post) {
      // Go to profile of recipient (author) to see the post (simplification) or navigate to the user profile containing posts.
      navigate(`/profile/${n.recipient}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <FiHeart className="notif-type-icon like" />;
      case 'comment': return <FiMessageSquare className="notif-type-icon comment" />;
      case 'follow': return <FiUserPlus className="notif-type-icon follow" />;
      default: return null;
    }
  };

  const getNotificationText = (type) => {
    switch (type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'follow': return 'started following you';
      default: return '';
    }
  };

  return (
    <div className="notif-drawer">
      <div className="drawer-header">
        <h2>Notifications</h2>
        <div className="drawer-header-actions">
          {notifications.some(n => !n.isRead) && (
            <button className="btn-mark-read" onClick={handleMarkAllRead} title="Mark all as read">
              <FiCheck /> Mark all read
            </button>
          )}
          <button className="btn-icon" onClick={onClose} aria-label="Close Notifications">
            <FiX />
          </button>
        </div>
      </div>

      <div className="drawer-body">
        {loading ? (
          <div className="notif-loading"><p>Retrieving logs...</p></div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <span className="bell-icon">🔔</span>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <ul className="notif-list">
            {notifications.map((n) => (
              <li
                key={n._id}
                className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(n)}
              >
                <img src={n.sender.avatar} alt={n.sender.username} className="notif-sender-avatar" />
                <div className="notif-content">
                  <p className="notif-msg">
                    <strong>@{n.sender.username}</strong> {getNotificationText(n.type)}
                  </p>
                  <span className="notif-time">
                    {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {getNotificationIcon(n.type)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
