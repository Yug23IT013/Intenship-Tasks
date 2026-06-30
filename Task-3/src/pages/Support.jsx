import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPhone, FiMail, FiMapPin, FiClock, FiMessageSquare } from 'react-icons/fi';

const FAQ = [
  { q: 'What are your delivery timings?', a: 'We deliver from 8 AM to 9 PM, Monday to Saturday. On Sundays, delivery is available from 9 AM to 7 PM.' },
  { q: 'How long does delivery take?', a: 'Most orders within Bengaluru are delivered within 1–3 hours of placing the order. For outskirts, it may take 3–5 hours.' },
  { q: 'Do you have a minimum order value?', a: 'No minimum order! Orders above ₹499 get free delivery. Below that, a small delivery charge of ₹40 applies.' },
  { q: 'Can I cancel or modify my order?', a: 'You can cancel or modify your order within 30 minutes of placing it. Call us directly for quick assistance.' },
  { q: 'What is your return policy?', a: 'We offer a 7-day return policy on all non-perishable items. For fresh products, contact us within 2 hours of delivery.' },
  { q: 'Do you accept UPI payments?', a: 'Yes! We accept Cash on Delivery, UPI (PhonePe, GPay, Paytm), and all major debit/credit cards.' },
];

const Support = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return; }
    toast.success('Message sent! We\'ll reply within 2 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="support-page">
      <div className="support-hero">
        <h1 className="page-title">Customer Support</h1>
        <p>We're here to help! Reach out to us through any channel below.</p>
      </div>

      {/* Contact cards */}
      <div className="contact-cards">
        <div className="contact-card">
          <div className="contact-icon phone"><FiPhone size={22} /></div>
          <h3>Call Us</h3>
          <p>+91 98765 43210</p>
          <small>Mon–Sat: 8 AM – 9 PM</small>
        </div>
        <div className="contact-card">
          <div className="contact-icon email"><FiMail size={22} /></div>
          <h3>Email Us</h3>
          <p>support@mycart.com</p>
          <small>We reply within 2 hours</small>
        </div>
        <div className="contact-card">
          <div className="contact-icon chat"><FiMessageSquare size={22} /></div>
          <h3>WhatsApp</h3>
          <p>+91 98765 43210</p>
          <small>Available all day</small>
        </div>
        <div className="contact-card">
          <div className="contact-icon map"><FiMapPin size={22} /></div>
          <h3>Visit Us</h3>
          <p>42, Market Road</p>
          <small>Bengaluru – 560001</small>
        </div>
      </div>

      <div className="support-layout">
        {/* Contact form */}
        <div className="support-form-wrap">
          <h2 className="section-title">Send Us a Message</h2>
          <form className="support-form" onSubmit={handleSubmit} id="support-form">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="s-name">Name *</label>
                <input id="s-name" type="text" placeholder="Ramesh Kumar" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="s-email">Email *</label>
                <input id="s-email" type="email" placeholder="ramesh@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="s-subject">Subject</label>
              <input id="s-subject" type="text" placeholder="e.g. Order issue, Delivery question..." value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="s-message">Message *</label>
              <textarea id="s-message" rows="5" placeholder="Describe your issue in detail..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
            </div>
            <button type="submit" className="btn-primary" id="send-message-btn">Send Message</button>
          </form>
        </div>

        {/* FAQ */}
        <div className="faq-wrap">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {FAQ.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} id={`faq-${i}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {item.q}
                  <span className="faq-arrow">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="faq-answer">{item.a}</p>}
              </div>
            ))}
          </div>

          <div className="store-hours">
            <h3><FiClock size={15} /> Store Hours</h3>
            <table>
              <tbody>
                <tr><td>Monday – Saturday</td><td>8:00 AM – 9:00 PM</td></tr>
                <tr><td>Sunday</td><td>9:00 AM – 7:00 PM</td></tr>
                <tr><td>Public Holidays</td><td>10:00 AM – 6:00 PM</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
