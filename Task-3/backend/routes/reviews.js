const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// POST /api/reviews/:productId
router.post('/:productId',
  optionalAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('comment').trim().isLength({ min: 5 }).withMessage('Comment must be at least 5 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const product = await Product.findById(req.params.productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const { name, rating, comment } = req.body;
      const review = await Review.create({
        product: product._id,
        user:    req.user?._id,
        name,
        rating: Number(rating),
        comment,
      });

      res.status(201).json({ success: true, data: review });
    } catch (err) {
      if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Product not found' });
      res.status(500).json({ message: 'Error submitting review' });
    }
  }
);

module.exports = router;
