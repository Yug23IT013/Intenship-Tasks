import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <div className="footer-logo">
          <span>🏪</span>
          <span className="footer-name">LocalMart</span>
        </div>
        <p className="footer-desc">Your trusted neighbourhood store — now online. Fresh products, fair prices, fast delivery.</p>
        <div className="footer-social">
          <a href="#" id="fb-link" aria-label="Facebook"><FiFacebook /></a>
          <a href="#" id="ig-link" aria-label="Instagram"><FiInstagram /></a>
        </div>
      </div>

      <div className="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><Link to="/" id="footer-home">Home</Link></li>
          <li><Link to="/products" id="footer-products">All Products</Link></li>
          <li><Link to="/cart" id="footer-cart">My Cart</Link></li>
          <li><Link to="/track" id="footer-track">Track Order</Link></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Categories</h4>
        <ul>
          <li><Link to="/products?category=groceries" id="footer-groceries">Groceries</Link></li>
          <li><Link to="/products?category=dairy" id="footer-dairy">Dairy</Link></li>
          <li><Link to="/products?category=snacks" id="footer-snacks">Snacks</Link></li>
          <li><Link to="/products?category=beverages" id="footer-beverages">Beverages</Link></li>
          <li><Link to="/products?category=electronics" id="footer-electronics">Electronics</Link></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Contact Us</h4>
        <ul className="contact-list">
          <li><FiMapPin size={13} /> 42, Market Road, Bengaluru - 560001</li>
          <li><FiPhone size={13} /> +91 98765 43210</li>
          <li><FiMail size={13} /> hello@localmart.in</li>
        </ul>
        <p className="hours">Mon–Sat: 8 AM – 9 PM<br />Sun: 9 AM – 7 PM</p>
      </div>
    </div>

    <div className="footer-bottom">
      <p>© 2024 LocalMart. All rights reserved.</p>
      <div className="footer-bottom-links">
        <Link to="/support" id="footer-support">Customer Support</Link>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Use</a>
      </div>
    </div>
  </footer>
);

export default Footer;
