/**
 * Script to recalculate averageRating for all products based on their reviews
 * Run with: node src/scripts/recalculateRatings.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

// Import models
const Product = require('../models/product.model');
const Review = require('../models/review.model');

const MONGO_URI = process.env.MONGO_URI;

async function recalculateAllRatings() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({}, '_id name averageRating');
    console.log(`Found ${products.length} products to process`);

    let updated = 0;
    let unchanged = 0;

    for (const product of products) {
      // Calculate average rating from reviews
      const stats = await Review.aggregate([
        { $match: { productId: product._id } },
        {
          $group: {
            _id: '$productId',
            nRating: { $sum: 1 },
            avgRating: { $avg: '$rating' },
          },
        },
      ]);

      let newRating = 0;
      let reviewCount = 0;

      if (stats.length > 0) {
        newRating = Math.round(stats[0].avgRating * 10) / 10;
        reviewCount = stats[0].nRating;
      }

      const oldRating = product.averageRating || 0;

      if (oldRating !== newRating) {
        await Product.findByIdAndUpdate(product._id, {
          averageRating: newRating,
        });
        console.log(`✓ Updated "${product.name}": ${oldRating} → ${newRating} (${reviewCount} reviews)`);
        updated++;
      } else {
        unchanged++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Updated: ${updated} products`);
    console.log(`Unchanged: ${unchanged} products`);
    console.log('Done!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

recalculateAllRatings();
