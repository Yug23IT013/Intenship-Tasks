import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeatured, getDeals } from '../api/api';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../data/products';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, d] = await Promise.all([getFeatured(), getDeals()]);
        setFeatured(f.data.data);
        setDeals(d.data.data);
      } catch (err) {
        console.error('Failed to load home data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="home-page">

      {/* Hero Banner */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">🏪 Bengaluru's Favourite Local Store</p>
          <h1 className="hero-title">Fresh Products,<br />Delivered to Your Door</h1>
          <p className="hero-sub">Shop groceries, dairy, snacks, electronics and more — sourced fresh every morning from local suppliers.</p>
          <div className="hero-btns">
            <Link to="/products" className="btn-primary" id="shop-now-btn">Shop Now <FiArrowRight /></Link>
            <Link to="/track" className="btn-outline" id="track-order-btn">Track Order</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>500+</strong><span>Products</span></div>
            <div className="hero-stat"><strong>10K+</strong><span>Customers</span></div>
            <div className="hero-stat"><strong>4.8★</strong><span>Rating</span></div>
          </div>
        </div>
        <div className="hero-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=500&fit=crop"
            alt="Fresh groceries and products"
            className="hero-img"
          />
        </div>
      </section>

      {/* Trust badges */}
      <section className="trust-bar">
        <div className="trust-inner">
          {[
            { Icon: FiTruck,      title: 'Free Delivery',   sub: 'On orders above ₹499' },
            { Icon: FiShield,     title: '100% Fresh',      sub: 'Sourced daily from farms' },
            { Icon: FiRefreshCw,  title: 'Easy Returns',    sub: '7-day hassle-free returns' },
            { Icon: FiHeadphones, title: '24/7 Support',    sub: 'We\'re always here to help' },
          ].map(({ Icon, title, sub }) => (
            <div className="trust-item" key={title}>
              <Icon size={22} className="trust-icon" />
              <div><strong>{title}</strong><span>{sub}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
        </div>
        <div className="category-grid">
          {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="category-card" id={`cat-${cat.id}`}>
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Deals */}
      {deals.length > 0 && (
        <section className="section deals-section">
          <div className="section-header">
            <div><span className="section-tag">🔥 Limited Time</span><h2 className="section-title">Today's Best Deals</h2></div>
            <Link to="/products" className="view-all-link" id="view-all-deals">View All <FiArrowRight size={14} /></Link>
          </div>
          {loading ? <p className="page-subtitle">Loading…</p> : <div className="products-grid">{deals.map(p => <ProductCard key={p._id} product={p} />)}</div>}
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="section">
          <div className="section-header">
            <div><span className="section-tag">⭐ Customer Favourites</span><h2 className="section-title">Featured Products</h2></div>
            <Link to="/products" className="view-all-link" id="view-all-featured">View All <FiArrowRight size={14} /></Link>
          </div>
          {loading ? <p className="page-subtitle">Loading…</p> : <div className="products-grid">{featured.map(p => <ProductCard key={p._id} product={p} />)}</div>}
        </section>
      )}

      {/* Promo */}
      <section className="promo-banner">
        <div className="promo-content">
          <h2>Get ₹50 off your first order</h2>
          <p>Use code <strong>LOCALMART50</strong> at checkout</p>
          <Link to="/products" className="btn-primary" id="promo-shop-btn">Start Shopping</Link>
        </div>
        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop" alt="Special offer" className="promo-img" />
      </section>
    </div>
  );
};

export default Home;
