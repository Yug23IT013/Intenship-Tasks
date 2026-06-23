const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  brand:         { type: String, required: true, trim: true },
  category:      { type: String, required: true,
                   enum: ['groceries','dairy','snacks','beverages','personal','household','electronics'] },
  price:         { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0 },
  description:   { type: String, required: true },
  image:         { type: String, default: '' },
  inStock:       { type: Boolean, default: true },
  tags:          [{ type: String }],
  // Derived / cached from Reviews
  rating:        { type: Number, default: 0 },
  numReviews:    { type: Number, default: 0 },
}, { timestamps: true });

// Virtual: discount %
productSchema.virtual('discount').get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
