import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../api/api';
import NotificationCenter from './NotificationCenter';
import { FiHome, FiCompass, FiBell, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';

const Navbar = ({ notifUpdateTrigger }) => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await getNotifications();
      const unread = res.data.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      console.error('Failed to update unread notifications count');
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [user, notifUpdateTrigger, location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">✨</span>
          <span className="brand-name">VibeGrid</span>
        </Link>

        {user && (
          <nav className="nav-menu">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} title="Home">
              <FiHome /> <span className="nav-label">Home</span>
            </Link>

            <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`} title="Explore">
              <FiCompass /> <span className="nav-label">Explore</span>
            </Link>

            <button
              className={`nav-link-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <div className="icon-badge-wrap">
                <FiBell />
                {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
              </div>
              <span className="nav-label">Notifications</span>
            </button>

            <Link to={`/profile/${user._id}`} className={`nav-link ${isActive(`/profile/${user._id}`) ? 'active' : ''}`} title="Profile">
              <FiUser /> <span className="nav-label">Profile</span>
            </Link>

            <button className="nav-link-btn btn-logout-nav" onClick={handleLogout} title="Log Out">
              <FiLogOut /> <span className="nav-label">Log Out</span>
            </button>
          </nav>
        )}
      </div>

      {/* Slide-down notifications drawer */}
      {showNotifications && (
        <div className="notif-drawer-overlay">
          <NotificationCenter
            onClose={() => setShowNotifications(false)}
            onMarkRead={fetchUnreadCount}
          />
        </div>
      )}
    </header>
  );
};

export default Navbar;
