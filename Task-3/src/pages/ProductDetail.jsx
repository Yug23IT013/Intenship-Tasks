import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, getRelated, getReviews, submitReview } from '../api/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { FiStar, FiShoppingCart, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';

const StarDisplay = ({ rating, size = 16 }) => (
  <span className="stars">
    {[1,2,3,4,5].map(n => <FiStar key={n} size={size} className={`star ${n <= Math.round(rating) ? 'filled' : ''}`} />)}
  </span>
);

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, items } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, rRes, revRes] = await Promise.all([
          getProduct(id),
          getRelated(id),
          getReviews(id),
        ]);
        setProduct(pRes.data.data);
        setRelated(rRes.data.data);
        setReviews(revRes.data.data);
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await submitReview(id, reviewForm);
      setReviews(prev => [res.data.data, ...prev]);
      // Update product rating display
      setProduct(prev => prev ? { ...prev, numReviews: (prev.numReviews || 0) + 1 } : prev);
      setReviewForm({ name: '', rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="not-found"><p>Loading…</p></div>;
  if (!product) return <div className="not-found"><h2>Product not found</h2><Link to="/products" className="btn-primary">Browse Products</Link></div>;

  const cartItem = items.find(i => i.id === product._id || i._id === product._id);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  // Adapt product for cart (use _id as id)
  const cartProduct = { ...product, id: product._id };

  return (
    <div className="product-detail-page">
      <nav className="breadcrumb">
        <Link to="/" id="bc-home">Home</Link> /
        <Link to="/products" id="bc-products">Products</Link> /
        <Link to={`/products?category=${product.category}`} id="bc-category">{product.category}</Link> /
        <span>{product.name}</span>
      </nav>

      <div className="detail-main">
        <div className="detail-image-wrap">
          {discount > 0 && <span className="detail-discount-badge">{discount}% OFF</span>}
          <img src={product.image} alt={product.name} className="detail-image"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=600&fit=crop'; }} />
        </div>

        <div className="detail-info">
          <p className="detail-brand">{product.brand}</p>
          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-rating">
            <StarDisplay rating={product.rating} size={18} />
            <span className="rating-val">{product.rating?.toFixed(1) || '0.0'}</span>
            <span className="rating-count">({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})</span>
          </div>

          <div className="detail-price-row">
            <span className="detail-price">₹{product.price}</span>
            {discount > 0 && <>
              <span className="detail-original">₹{product.originalPrice}</span>
              <span className="detail-saving">You save ₹{product.originalPrice - product.price}</span>
            </>}
          </div>

          {product.tags?.length > 0 && (
            <div className="detail-tags">{product.tags.map(t => <span key={t} className="detail-tag">{t}</span>)}</div>
          )}

          <div className={`stock-status ${product.inStock ? 'in-stock' : 'out'}`}>
            {product.inStock ? <><FiCheck size={14} /> In Stock — Ready to ship</> : '❌ Out of Stock'}
          </div>

          {product.inStock && (
            <div className="qty-row">
              <label className="qty-label">Quantity</label>
              <div className="qty-control">
                <button id="qty-minus" className="qty-btn" onClick={() => setQty(q => Math.max(1, q-1))}><FiMinus size={13} /></button>
                <span className="qty-val">{qty}</span>
                <button id="qty-plus" className="qty-btn" onClick={() => setQty(q => q+1)}><FiPlus size={13} /></button>
              </div>
            </div>
          )}

          <div className="detail-actions">
            <button
              className={`btn-add-cart ${cartItem ? 'in-cart' : ''}`}
              id="detail-add-cart-btn"
              onClick={() => addToCart(cartProduct, qty)}
              disabled={!product.inStock}
            >
              <FiShoppingCart size={17} />
              {cartItem ? 'Add More to Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <Link to="/cart" className="btn-go-cart" id="go-to-cart-btn">Go to Cart</Link>
          </div>

          <div className="delivery-note">
            🚚 Free delivery on orders above ₹499 &nbsp;·&nbsp; 📦 Ships in 1–2 hours
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        <div className="tabs-bar">
          {['description', 'reviews'].map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              id={`tab-${tab}`} onClick={() => setActiveTab(tab)}>
              {tab === 'description' ? 'Description' : `Reviews (${reviews.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="tab-content">
            <p className="desc-text">{product.description}</p>
            <table className="spec-table">
              <tbody>
                <tr><td>Brand</td><td>{product.brand}</td></tr>
                <tr><td>Category</td><td>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td></tr>
                <tr><td>Availability</td><td>{product.inStock ? 'In Stock' : 'Out of Stock'}</td></tr>
                {product.tags?.map(t => <tr key={t}><td>Tag</td><td>{t}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="tab-content">
            <div className="review-form-wrap">
              <h3 className="review-form-title">Write a Review</h3>
              <form className="review-form" onSubmit={handleReviewSubmit} id="review-form">
                <div className="review-row">
                  <div className="form-group">
                    <label htmlFor="review-name">Your Name</label>
                    <input id="review-name" type="text" placeholder="Ramesh Kumar" value={reviewForm.name}
                      onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="review-rating">Rating</label>
                    <select id="review-rating" value={reviewForm.rating}
                      onChange={e => setReviewForm(p => ({ ...p, rating: Number(e.target.value) }))}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="review-comment">Your Review</label>
                  <textarea id="review-comment" rows="3" placeholder="Share your experience…"
                    value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} required />
                </div>
                <button type="submit" className="btn-primary" id="submit-review-btn" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            </div>

            {reviews.length === 0
              ? <p className="no-reviews">No reviews yet. Be the first to review!</p>
              : <ul className="reviews-list">
                  {reviews.map(r => (
                    <li key={r._id} className="review-item">
                      <div className="review-top">
                        <div className="reviewer-avatar">{r.name.charAt(0)}</div>
                        <div>
                          <strong>{r.name}</strong>
                          <div className="review-meta">
                            <StarDisplay rating={r.rating} size={13} />
                            <span className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                      <p className="review-comment">{r.comment}</p>
                    </li>
                  ))}
                </ul>
            }
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <h2 className="section-title">Related Products</h2>
          <div className="products-grid">{related.map(p => <ProductCard key={p._id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
