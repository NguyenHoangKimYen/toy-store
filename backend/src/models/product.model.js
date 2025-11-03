const mongoose = require('mongoose');

require('./category.model.js');
require('./tag.model.js');

const ProductSchema = new mongoose.Schema({
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
    require: true,
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  },

  description: {
    type: String,
    required: true,
  },

  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
    },
  ],

  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },

  originalPrice: {
    type: mongoose.Schema.Types.Decimal128,
    default: null,
  },

  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },

  soldCount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    index: true,
  },

  averageRating: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 5,
  },

  imageUrls: [
    {
      type: String,
      trim: true,
    },
  ],

}, {
  timestamps: true,
  collection: 'products',
});

module.exports = mongoose.model('Product', ProductSchema);