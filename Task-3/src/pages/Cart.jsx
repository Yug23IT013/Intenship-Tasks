import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'LOCALMART50') {
      setDiscount(50);
      setCouponApplied(true);
      toast.success('Coupon applied! ₹50 off');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const delivery = totalPrice >= 499 ? 0 : 40;
  const finalTotal = totalPrice - discount + delivery;

  if (items.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started</p>
        <Link to="/products" className="btn-primary" id="shop-from-empty-cart">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="btn-back" id="back-btn" onClick={() => navigate(-1)}><FiArrowLeft /> Continue Shopping</button>
        <h1 className="page-title">Shopping Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})</h1>
        <button className="btn-clear" id="clear-cart-btn" onClick={() => { clearCart(); toast.success('Cart cleared'); }}>Clear All</button>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item" id={`cart-item-${item.id}`}>
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-img"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=80&h=80&fit=crop'; }}
              />
              <div className="cart-item-info">
                <p className="cart-item-brand">{item.brand}</p>
                <Link to={`/product/${item.id}`} className="cart-item-name" id={`cart-product-${item.id}`}>{item.name}</Link>
                <p className="cart-item-price">₹{item.price} each</p>
              </div>
              <div className="cart-item-controls">
                <div className="qty-control">
                  <button className="qty-btn" id={`minus-${item.id}`} onClick={() => updateQty(item.id, item.qty - 1)}><FiMinus size={12} /></button>
                  <span className="qty-val">{item.qty}</span>
                  <button className="qty-btn" id={`plus-${item.id}`} onClick={() => updateQty(item.id, item.qty + 1)}><FiPlus size={12} /></button>
                </div>
                <p className="cart-item-subtotal">₹{item.price * item.qty}</p>
                <button className="btn-remove" id={`remove-${item.id}`} onClick={() => removeFromCart(item.id)} title="Remove">
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h2 className="summary-title">Order Summary</h2>

          <div className="summary-rows">
            <div className="summary-row"><span>Subtotal ({totalItems} items)</span><span>₹{totalPrice}</span></div>
            <div className="summary-row"><span>Delivery</span><span>{delivery === 0 ? <span className="free">Free</span> : `₹${delivery}`}</span></div>
            {discount > 0 && <div className="summary-row discount"><span>Coupon Discount</span><span>−₹{discount}</span></div>}
            <div className="summary-row total"><span>Total</span><span>₹{finalTotal}</span></div>
          </div>

          {delivery > 0 && (
            <div className="delivery-progress">
              <p>Add ₹{499 - totalPrice} more for free delivery</p>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(totalPrice / 499) * 100}%` }}></div></div>
            </div>
          )}

          {/* Coupon */}
          {!couponApplied && (
            <div className="coupon-row">
              <input
                id="coupon-input"
                type="text"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                className="coupon-input"
              />
              <button className="btn-apply" id="apply-coupon-btn" onClick={applyCoupon}>Apply</button>
            </div>
          )}

          {couponApplied && (
            <div className="coupon-applied">✅ Coupon LOCALMART50 applied — ₹50 off!</div>
          )}

          <button
            className="btn-checkout"
            id="checkout-btn"
            onClick={() => navigate('/checkout')}
          >
            <FiShoppingBag size={16} /> Proceed to Checkout — ₹{finalTotal}
          </button>

          <div className="safe-checkout">🔒 Safe & Secure Checkout</div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
