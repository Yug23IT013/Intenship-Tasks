const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Guest order info (no login required)
  guestName:  { type: String },
  guestEmail: { type: String },
  guestPhone: { type: String },

  items:    [orderItemSchema],
  address:  {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    pincode: { type: String, required: true },
  },
  payment: {
    method:  { type: String, enum: ['cod', 'upi', 'card'], default: 'cod' },
    status:  { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  },
  subtotal:      { type: Number, required: true },
  deliveryCharge:{ type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  totalAmount:   { type: Number, required: true },

  status: {
    type: String,
    enum: ['Order Placed', 'Payment Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Order Placed',
  },
  timeline: [{
    step:  { type: String },
    done:  { type: Boolean, default: false },
    date:  { type: String },
  }],
  couponCode:    { type: String, default: '' },
  notes:         { type: String, default: '' },
}, { timestamps: true });

// Auto-generate order ID before first save
orderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const count = await mongoose.model('Order').countDocuments();
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
  this.orderId = `LM${dateStr}${String(count + 1).padStart(4, '0')}`;

  // Build initial timeline
  this.timeline = [
    { step: 'Order Placed',     done: true,  date: new Date().toLocaleString('en-IN') },
    { step: 'Payment Confirmed',done: this.payment.method !== 'cod', date: this.payment.method !== 'cod' ? new Date().toLocaleString('en-IN') : '' },
    { step: 'Packed',           done: false, date: '' },
    { step: 'Out for Delivery', done: false, date: '' },
    { step: 'Delivered',        done: false, date: '' },
  ];
  next();
});

module.exports = mongoose.model('Order', orderSchema);
