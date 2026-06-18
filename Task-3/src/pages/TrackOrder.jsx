import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackOrder } from '../api/api';
import { FiSearch, FiCheck, FiCircle } from 'react-icons/fi';

const STATUS_COLOR = {
  'Order Placed':     '#6366f1',
  'Payment Confirmed':'#3b82f6',
  'Packed':           '#f59e0b',
  'Out for Delivery': '#f97316',
  'Delivered':        '#10b981',
  'Cancelled':        '#ef4444',
};

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    try {
      const res = await trackOrder(orderId.trim());
      setOrder(res.data.data);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-page">
      <div className="track-hero">
        <h1 className="page-title">Track Your Order</h1>
        <p>Enter your Order ID to get real-time delivery updates</p>
      </div>

      <form className="track-form" onSubmit={handleSearch} id="track-form">
        <input id="order-id-input" type="text" placeholder="e.g. LM202406010001"
          value={orderId} onChange={e => setOrderId(e.target.value)} className="track-input" />
        <button type="submit" className="btn-primary" id="track-search-btn" disabled={loading}>
          <FiSearch size={15} /> {loading ? 'Searching…' : 'Track'}
        </button>
      </form>

      {notFound && (
        <div className="track-not-found">
          <p>❌ No order found with ID <strong>{orderId}</strong>. Please check and try again.</p>
        </div>
      )}

      {order && (
        <div className="track-result">
          <div className="track-info-card">
            <div className="track-info-row">
              <div><span className="info-label">Order ID</span><strong>{order.orderId}</strong></div>
              <div><span className="info-label">Date</span><strong>{new Date(order.createdAt).toLocaleDateString('en-IN')}</strong></div>
              <div><span className="info-label">Total</span><strong>₹{order.totalAmount}</strong></div>
              <div><span className="info-label">Status</span><span className="order-status delivered">{order.status}</span></div>
            </div>
            <div className="track-address">
              <strong>Deliver to:</strong> {order.address.street}, {order.address.city} - {order.address.pincode}
            </div>
          </div>

          <div className="timeline-card">
            <h2 className="timeline-title">Delivery Timeline</h2>
            <div className="timeline">
              {order.timeline.map((step, i) => (
                <div key={i} className={`timeline-step ${step.done ? 'done' : ''}`}>
                  <div className="step-icon" style={{
                    borderColor: step.done ? STATUS_COLOR[step.step] || '#10b981' : '#e2e8f0',
                    background:  step.done ? STATUS_COLOR[step.step] || '#10b981' : 'white',
                  }}>
                    {step.done ? <FiCheck size={14} color="white" /> : <FiCircle size={14} color="#cbd5e1" />}
                  </div>
                  {i < order.timeline.length - 1 && <div className={`step-line ${step.done ? 'done' : ''}`} />}
                  <div className="step-info">
                    <strong className={step.done ? 'step-done-text' : ''}>{step.step}</strong>
                    {step.done && step.date && <span className="step-date">{step.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ordered-items-card">
            <h2 className="timeline-title">Items Ordered</h2>
            <table className="ordered-items-table">
              <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>₹{item.price}</td>
                    <td>₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
