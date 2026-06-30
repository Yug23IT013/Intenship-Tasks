const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, optionalAuth } = require('../middleware/auth');

// POST /api/orders  — Place a new order (guest or logged-in)
router.post('/',
  optionalAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('phone').matches(/^\d{10}$/).withMessage('10-digit phone required'),
    body('address.street').trim().notEmpty().withMessage('Street address required'),
    body('address.city').trim().notEmpty().withMessage('City required'),
    body('address.pincode').matches(/^\d{6}$/).withMessage('6-digit pincode required'),
    body('items').isArray({ min: 1 }).withMessage('Cart cannot be empty'),
    body('payment').notEmpty().withMessage('Payment method required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { name, email, phone, address, items, payment, couponCode, notes } = req.body;

      // Validate & enrich items from DB
      const enrichedItems = [];
      for (const item of items) {
        const product = await Product.findById(item.productId || item.id);
        if (!product) return res.status(404).json({ message: `Product not found: ${item.name || item.id}` });
        if (!product.inStock) return res.status(400).json({ message: `${product.name} is out of stock` });
        enrichedItems.push({
          product: product._id,
          name:    product.name,
          image:   product.image,
          price:   product.price,
          qty:     Number(item.qty),
        });
      }

      // Calculate totals
      const subtotal = enrichedItems.reduce((s, i) => s + i.price * i.qty, 0);
      const deliveryCharge = subtotal >= 499 ? 0 : 40;

      // Coupon
      let discount = 0;
      if (couponCode?.toUpperCase() === 'MYCART50') discount = 50;

      const totalAmount = subtotal + deliveryCharge - discount;

      const order = await Order.create({
        user:        req.user?._id,
        guestName:   !req.user ? name : undefined,
        guestEmail:  !req.user ? email : undefined,
        guestPhone:  !req.user ? phone : undefined,
        items:       enrichedItems,
        address,
        payment:     { method: payment, status: payment === 'cod' ? 'pending' : 'paid' },
        subtotal,
        deliveryCharge,
        discount,
        totalAmount,
        couponCode:  couponCode || '',
        notes:       notes || '',
      });

      res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        data: {
          orderId:     order.orderId,
          totalAmount: order.totalAmount,
          status:      order.status,
          timeline:    order.timeline,
        },
      });
    } catch (err) {
      console.error('Order error:', err);
      res.status(500).json({ message: 'Error placing order' });
    }
  }
);

// GET /api/orders/track/:orderId  — Track any order by order ID string (no auth needed)
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('items.product', 'name image price')
      .lean();
    if (!order) return res.status(404).json({ message: 'Order not found. Please check the Order ID.' });

    res.json({
      success: true,
      data: {
        orderId:       order.orderId,
        status:        order.status,
        timeline:      order.timeline,
        items:         order.items,
        address:       order.address,
        payment:       order.payment,
        subtotal:      order.subtotal,
        deliveryCharge:order.deliveryCharge,
        discount:      order.discount,
        totalAmount:   order.totalAmount,
        createdAt:     order.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// GET /api/orders/my  — Get logged-in user's orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your orders' });
  }
});

// GET /api/orders/:id  — Get order by MongoDB ID (owner or admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image').lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user?.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

module.exports = router;
