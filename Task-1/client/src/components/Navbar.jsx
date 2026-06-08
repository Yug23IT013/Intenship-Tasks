import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <span className="brand-icon">🔐</span>
          <span className="brand-name">AuthSystem</span>
        </Link>
      </div>

      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link nav-link-admin">
                Admin Panel
              </Link>
            )}
            <div className="nav-user">
              <div className="user-avatar">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className={`user-role role-${user.role}`}>{user.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn-register">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
