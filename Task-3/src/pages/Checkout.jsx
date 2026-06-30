import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api/api';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';

const EMPTY_FORM = { name: '', email: '', phone: '', address: '', city: '', pincode: '', payment: 'cod' };

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const delivery = totalPrice >= 499 ? 0 : 40;
  const finalTotal = totalPrice - discount + delivery;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone || !/^\d{10}$/.test(form.phone)) e.phone = '10-digit phone required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit pincode required';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'MYCART50') {
      setDiscount(50);
      setCouponApplied(true);
      toast.success('Coupon applied! ₹50 off');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setPlacing(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: { street: form.address, city: form.city, pincode: form.pincode },
        payment: form.payment,
        couponCode: couponApplied ? 'MYCART50' : '',
        items: items.map(i => ({ productId: i._id || i.id, name: i.name, qty: i.qty })),
      };
      const res = await placeOrder(payload);
      setOrderId(res.data.data.orderId);
      clearCart();
      setPlaced(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <div className="order-success">
        <div className="success-icon"><FiCheck size={40} /></div>
        <h1>Order Placed Successfully! 🎉</h1>
        <p>Thank you <strong>{form.name}</strong>! Your order has been confirmed.</p>
        <div className="order-id-box">Order ID: <strong>{orderId}</strong></div>
        <p className="success-msg">We'll send updates to <strong>{form.email}</strong>. Expected delivery: <strong>Today by 7 PM</strong></p>
        <div className="success-actions">
          <button className="btn-primary" id="track-placed-order-btn" onClick={() => navigate(`/track?orderId=${orderId}`)}>Track Order</button>
          <button className="btn-outline" id="continue-shopping-btn" onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} id="checkout-form">
          <div className="checkout-section">
            <h2 className="checkout-section-title">📦 Delivery Details</h2>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="c-name">Full Name *</label>
                <input id="c-name" name="name" value={form.name} onChange={handleChange} placeholder="Ramesh Kumar" className={errors.name ? 'err' : ''} />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="c-phone">Phone *</label>
                <input id="c-phone" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" className={errors.phone ? 'err' : ''} />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="c-email">Email *</label>
              <input id="c-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="ramesh@email.com" className={errors.email ? 'err' : ''} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="c-address">Street Address *</label>
              <textarea id="c-address" name="address" rows="2" value={form.address} onChange={handleChange} placeholder="12, MG Road" className={errors.address ? 'err' : ''} />
              {errors.address && <span className="form-error">{errors.address}</span>}
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="c-city">City *</label>
                <input id="c-city" name="city" value={form.city} onChange={handleChange} placeholder="Bengaluru" className={errors.city ? 'err' : ''} />
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="c-pincode">Pincode *</label>
                <input id="c-pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="560001" className={errors.pincode ? 'err' : ''} />
                {errors.pincode && <span className="form-error">{errors.pincode}</span>}
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h2 className="checkout-section-title">💳 Payment Method</h2>
            <div className="payment-options">
              {[
                { value: 'cod',  label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
                { value: 'upi',  label: '📱 UPI / QR Code',    desc: 'PhonePe, GPay, Paytm' },
                { value: 'card', label: '💳 Debit / Credit Card', desc: 'Visa, Mastercard, Rupay' },
              ].map(opt => (
                <label key={opt.value} className={`payment-option ${form.payment === opt.value ? 'selected' : ''}`} htmlFor={`pay-${opt.value}`}>
                  <input id={`pay-${opt.value}`} type="radio" name="payment" value={opt.value} checked={form.payment === opt.value} onChange={handleChange} />
                  <div><strong>{opt.label}</strong><span>{opt.desc}</span></div>
                </label>
              ))}
            </div>
          </div>

          {/* Coupon in checkout */}
          {!couponApplied ? (
            <div className="checkout-section">
              <h2 className="checkout-section-title">🎟️ Coupon Code</h2>
              <div className="coupon-row">
                <input id="checkout-coupon-input" type="text" placeholder="MYCART50" value={coupon} onChange={e => setCoupon(e.target.value)} className="coupon-input" />
                <button type="button" className="btn-apply" id="apply-checkout-coupon-btn" onClick={applyCoupon}>Apply</button>
              </div>
            </div>
          ) : (
            <div className="checkout-section">
              <div className="coupon-applied">✅ Coupon MYCART50 applied — ₹50 off!</div>
            </div>
          )}

          <button type="submit" className="btn-place-order" id="place-order-btn" disabled={placing}>
            {placing ? '⏳ Placing Order…' : `✅ Place Order — ₹${finalTotal}`}
          </button>
        </form>

        <div className="checkout-summary">
          <h2 className="summary-title">Order Summary</h2>
          <ul className="checkout-items">
            {items.map(i => (
              <li key={i._id || i.id} className="checkout-item">
                <img src={i.image} alt={i.name} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=60&h=60&fit=crop'; }} />
                <span className="checkout-item-name">{i.name} × {i.qty}</span>
                <span className="checkout-item-price">₹{i.price * i.qty}</span>
              </li>
            ))}
          </ul>
          <div className="summary-rows">
            <div className="summary-row"><span>Subtotal</span><span>₹{totalPrice}</span></div>
            {discount > 0 && <div className="summary-row discount"><span>Discount</span><span>−₹{discount}</span></div>}
            <div className="summary-row"><span>Delivery</span><span>{delivery === 0 ? <span className="free">Free</span> : `₹${delivery}`}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{finalTotal}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
