import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiStar, FiShoppingCart, FiEye } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const { addToCart, items } = useCart();
  const pId = product._id || product.id;
  const inCart = items.some(i => (i._id || i.id) === pId);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card" id={`product-card-${pId}`}>
      {/* Image */}
      <div className="card-image-wrap">
        <Link to={`/product/${pId}`} id={`view-product-${pId}`}>
          <img
            src={product.image}
            alt={product.name}
            className="card-image"
            loading="lazy"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=400&fit=crop'; }}
          />
        </Link>
        {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
        {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        {product.tags?.[0] && product.inStock && (
          <span className="tag-badge">{product.tags[0]}</span>
        )}
      </div>

      {/* Info */}
      <div className="card-body">
        <p className="card-brand">{product.brand}</p>
        <Link to={`/product/${pId}`} className="card-name" id={`product-name-${pId}`}>
          {product.name}
        </Link>

        {/* Rating */}
        <div className="card-rating">
          <span className="stars">
            {[1,2,3,4,5].map(n => (
              <FiStar key={n} className={`star ${n <= Math.round(product.rating) ? 'filled' : ''}`} />
            ))}
          </span>
          <span className="rating-num">{product.rating}</span>
          <span className="review-count">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="card-price-row">
          <span className="price">₹{product.price}</span>
          {discount > 0 && <span className="original-price">₹{product.originalPrice}</span>}
        </div>

        {/* Actions */}
        <div className="card-actions">
          <button
            className={`btn-cart ${inCart ? 'in-cart' : ''}`}
            id={`add-to-cart-${pId}`}
            onClick={() => product.inStock && addToCart(product)}
            disabled={!product.inStock}
          >
            <FiShoppingCart size={14} />
            {inCart ? 'In Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <Link to={`/product/${pId}`} className="btn-view" id={`quick-view-${pId}`} title="View Details">
            <FiEye size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
