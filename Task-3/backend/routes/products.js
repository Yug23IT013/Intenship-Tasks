const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products
// Query: search, category, minPrice, maxPrice, inStock, sort, page, limit
router.get('/', async (req, res) => {
  try {
    const page    = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit   = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip    = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: re }, { brand: re }, { description: re }, { tags: re }];
    }
    if (req.query.category && req.query.category !== 'all')
      filter.category = req.query.category;
    if (req.query.inStock === 'true') filter.inStock = true;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Sort
    const sortMap = {
      'price-asc':  { price: 1 },
      'price-desc': { price: -1 },
      'rating':     { rating: -1 },
      'newest':     { createdAt: -1 },
      'discount':   { originalPrice: -1 },
    };
    const sort = sortMap[req.query.sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    // Category stats for sidebar
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      categoryStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const featured = await Product.find({ inStock: true }).sort({ rating: -1 }).limit(8).lean();
    res.json({ success: true, data: featured });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching featured products' });
  }
});

// GET /api/products/deals
router.get('/deals', async (req, res) => {
  try {
    const deals = await Product.find({
      inStock: true,
      $expr: { $gt: ['$originalPrice', '$price'] },
    }).sort({ createdAt: -1 }).limit(8).lean();
    res.json({ success: true, data: deals });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching deals' });
  }
});

// GET /api/products/related/:id
router.get('/related/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const related = await Product.find({ category: product.category, _id: { $ne: product._id } })
      .limit(4).lean();
    res.json({ success: true, data: related });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching related products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Product not found' });
    res.status(500).json({ message: 'Error fetching product' });
  }
});

module.exports = router;
