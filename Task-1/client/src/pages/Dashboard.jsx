import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.forbidden) {
      toast.error('Access denied. Admin role required.');
    }
  }, [location.state]);

  const stats = [
    { label: 'Account Status', value: 'Active', icon: '✅', color: '#10b981' },
    { label: 'Your Role', value: user?.role?.toUpperCase(), icon: '🎭', color: '#6366f1' },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—', icon: '📅', color: '#f59e0b' },
    { label: 'Last Login', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now', icon: '🕐', color: '#ec4899' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="welcome-badge">👋 Welcome back</div>
        <h1 className="page-title">
          Hello, <span className="gradient-text">{user?.username}</span>!
        </h1>
        <p className="page-subtitle">
          You&apos;re successfully authenticated. Here&apos;s your account overview.
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
            <div className="stat-body">
              <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="info-card">
        <h2 className="info-card-title">🔐 Your Profile</h2>
        <div className="profile-grid">
          <div className="profile-row">
            <span className="profile-key">User ID</span>
            <span className="profile-val mono">{user?._id}</span>
          </div>
          <div className="profile-row">
            <span className="profile-key">Username</span>
            <span className="profile-val">{user?.username}</span>
          </div>
          <div className="profile-row">
            <span className="profile-key">Email</span>
            <span className="profile-val">{user?.email}</span>
          </div>
          <div className="profile-row">
            <span className="profile-key">Role</span>
            <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h2 className="info-card-title">🛡️ Security Overview</h2>
        <div className="security-items">
          <div className="security-item">
            <span className="security-check">✅</span>
            <div>
              <strong>Password Protected</strong>
              <p>Your password is hashed with bcrypt (12 salt rounds)</p>
            </div>
          </div>
          <div className="security-item">
            <span className="security-check">✅</span>
            <div>
              <strong>JWT Authentication</strong>
              <p>Access tokens expire in 15 minutes for security</p>
            </div>
          </div>
          <div className="security-item">
            <span className="security-check">✅</span>
            <div>
              <strong>Secure Session</strong>
              <p>Refresh tokens stored in HTTP-only cookies (no XSS risk)</p>
            </div>
          </div>
          <div className="security-item">
            <span className="security-check">✅</span>
            <div>
              <strong>Role-Based Access</strong>
              <p>Your role (<strong>{user?.role}</strong>) controls what you can access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
