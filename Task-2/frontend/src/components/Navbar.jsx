import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiHome, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { MdOutlineManageAccounts } from 'react-icons/md';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/employees', icon: <FiUsers />, label: 'Employees' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);


  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <MdOutlineManageAccounts className="brand-icon" />
        <span className="brand-text">EMS</span>
      </div>

      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        <div className="user-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="user-avatar" id="user-avatar-btn">
            <span className="user-name-text">{user?.name}</span>
          </div>
          <div className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
            <div className="dropdown-header">
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>
            <hr className="dropdown-divider" />
            <button className="dropdown-item danger" id="logout-btn" onClick={handleLogout}>
              <FiLogOut /> Sign Out
            </button>
          </div>
        </div>

        <button
          className="hamburger"
          id="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
