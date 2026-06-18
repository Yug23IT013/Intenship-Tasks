import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiSearch, FiMenu, FiX, FiMapPin } from 'react-icons/fi';

const Navbar = () => {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-inner">
          <span className="topbar-info"><FiMapPin size={12} /> Free delivery on orders above ₹499</span>
          <div className="topbar-links">
            <Link to="/track" id="track-order-topbar">Track Order</Link>
            <Link to="/support" id="support-topbar">Help</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <Link to="/" className="brand" id="brand-logo">
            <span className="brand-icon">🏪</span>
            <div>
              <span className="brand-name">LocalMart</span>
              <span className="brand-tagline">Your Neighbourhood Store</span>
            </div>
          </Link>

          {/* Search */}
          <form className="search-form" onSubmit={handleSearch} id="search-form">
            <input
              id="search-input"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" id="search-submit-btn" aria-label="Search">
              <FiSearch />
            </button>
          </form>

          {/* Nav right */}
          <div className="nav-right">
            <Link to="/cart" className="cart-btn" id="cart-btn">
              <FiShoppingCart size={20} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              <span className="cart-label">Cart</span>
            </Link>
            <button className="hamburger" id="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Category links */}
        <div className={`nav-links-bar ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} id="nav-home" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`} id="nav-products" onClick={() => setMenuOpen(false)}>All Products</Link>
          <Link to="/products?category=groceries" className="nav-link" id="nav-groceries" onClick={() => setMenuOpen(false)}>Groceries</Link>
          <Link to="/products?category=dairy" className="nav-link" id="nav-dairy" onClick={() => setMenuOpen(false)}>Dairy</Link>
          <Link to="/products?category=snacks" className="nav-link" id="nav-snacks" onClick={() => setMenuOpen(false)}>Snacks</Link>
          <Link to="/products?category=beverages" className="nav-link" id="nav-beverages" onClick={() => setMenuOpen(false)}>Beverages</Link>
          <Link to="/products?category=electronics" className="nav-link" id="nav-electronics" onClick={() => setMenuOpen(false)}>Electronics</Link>
          <Link to="/track" className="nav-link" id="nav-track" onClick={() => setMenuOpen(false)}>Track Order</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
