const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { protect } = require('../middleware/auth');

// @route   GET api/foods
// @desc    Get all foods
// @access  Public
router.get('/', async (req, res) => {
  try {
    const foods = await Food.find({});
    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST api/foods
// @desc    Create new food item
// @access  Private (Canteen & Admin)
router.post('/', protect, async (req, res) => {
    const { name, price, img, category, canteen, isVeg, stockQuantity } = req.body;

    try {
      const food = await Food.create({
        name,
        price: parseFloat(price),
        img,
        category,
        canteen,
        isVeg: isVeg !== undefined ? isVeg : true,
        available: true,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity, 10) : 15
      });

      res.status(201).json({ success: true, item: food });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // @route   PUT api/foods/:id
  // @desc    Toggle food availability or edit food item
  // @access  Private (Canteen & Admin)
  router.put('/:id', protect, async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);

      if (!food) {
        return res.status(404).json({ success: false, error: 'Food item not found' });
      }

      // Check if editing specific fields or just toggling availability
      if (Object.keys(req.body).length > 0) {
        if (req.body.name) food.name = req.body.name;
        if (req.body.price) food.price = parseFloat(req.body.price);
        if (req.body.category) food.category = req.body.category;
        if (req.body.img) food.img = req.body.img;
        if (req.body.hasOwnProperty('isVeg')) food.isVeg = req.body.isVeg;
        if (req.body.hasOwnProperty('available')) food.available = req.body.available;
        if (req.body.hasOwnProperty('stockQuantity')) food.stockQuantity = parseInt(req.body.stockQuantity, 10);
      } else {
        // Toggle availability if body is empty
        food.available = !food.available;
      }

    await food.save();

    res.json({ success: true, item: food });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE api/foods/:id
// @desc    Delete food item
// @access  Private (Canteen & Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    await Food.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST api/foods/:id/reviews
// @desc    Add review for food item
// @access  Private (Student only)
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, reviewText, orderId } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, error: 'Please provide a valid rating between 1 and 5' });
  }

  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can submit food reviews' });
    }

    // Safely handle custom specials which are not in the standard menu collection
    if (req.params.id && req.params.id.startsWith('custom_special_')) {
      if (orderId) {
        const Order = require('../models/Order');
        const order = await Order.findOne({ id: orderId });
        if (order) {
          order.isReviewed = true;
          await order.save();
        }
      }
      return res.json({ success: true, message: 'Custom special reviewed successfully (rating skipped)' });
    }

    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }

    // Create review
    const Review = require('../models/Review');
    const review = await Review.create({
      foodId: req.params.id,
      foodName: food.name,
      canteen: food.canteen,
      studentName: req.user.name,
      rating: parseFloat(rating),
      reviewText: reviewText || ''
    });

    // Update food average rating (start from 0, not 5.0, so real averages are accurate)
    const currentCount = food.ratingCount || 0;
    const currentRatingSum = (food.rating || 0) * currentCount;
    const newCount = currentCount + 1;
    const newRating = parseFloat(((currentRatingSum + parseFloat(rating)) / newCount).toFixed(2));

    food.rating = newRating;
    food.ratingCount = newCount;
    await food.save();

    // Mark order as reviewed if orderId is provided
    if (orderId) {
      const Order = require('../models/Order');
      const order = await Order.findOne({ id: orderId });
      if (order) {
        order.isReviewed = true;
        await order.save();
      }
    }

    res.status(201).json({ success: true, message: 'Review submitted successfully!', review, rating: food.rating, ratingCount: food.ratingCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET api/foods/canteen/:canteenName/reviews
// @desc    Get all reviews for food items of a specific canteen
// @access  Private
router.get('/canteen/:canteenName/reviews', protect, async (req, res) => {
  try {
    const Review = require('../models/Review');
    // Case-insensitive canteen name match to avoid mismatches
    const reviews = await Review.find({
      canteen: { $regex: new RegExp(`^${req.params.canteenName}$`, 'i') }
    }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET api/foods/canteen/:canteenName/ratings-summary
// @desc    Get per-dish aggregated avg rating + count for a canteen (server-side grouping)
// @access  Private
router.get('/canteen/:canteenName/ratings-summary', protect, async (req, res) => {
  try {
    const Review = require('../models/Review');

    // Use MongoDB aggregation for accurate grouping — no frontend math needed
    let summary;
    if (global.useMockDb) {
      // Fallback for mock db: manual grouping
      const reviews = await Review.find({
        canteen: { $regex: new RegExp(`^${req.params.canteenName}$`, 'i') }
      });
      const grouped = {};
      (reviews || []).forEach((rev) => {
        const key = rev.foodName;
        if (!grouped[key]) grouped[key] = { foodName: key, totalRating: 0, count: 0, latestComment: '' };
        grouped[key].totalRating += rev.rating;
        grouped[key].count += 1;
        if (rev.reviewText) grouped[key].latestComment = rev.reviewText;
      });
      summary = Object.values(grouped).map((d) => ({
        foodName: d.foodName,
        avgRating: parseFloat((d.totalRating / d.count).toFixed(2)),
        count: d.count,
        latestComment: d.latestComment
      }));
    } else {
      // MongoDB aggregation pipeline
      summary = await Review.aggregate([
        {
          $match: {
            canteen: { $regex: new RegExp(`^${req.params.canteenName}$`, 'i') }
          }
        },
        {
          $sort: { createdAt: 1 }
        },
        {
          $group: {
            _id: '$foodName',
            foodName: { $first: '$foodName' },
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
            latestComment: { $last: '$reviewText' }
          }
        },
        {
          $project: {
            _id: 0,
            foodName: 1,
            avgRating: { $round: ['$avgRating', 2] },
            count: 1,
            latestComment: 1
          }
        },
        { $sort: { avgRating: -1 } }
      ]);
    }

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
