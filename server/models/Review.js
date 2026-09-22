const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  foodId: {
    type: String,
    required: true
  },
  foodName: {
    type: String,
    required: true
  },
  canteen: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ReviewModel = mongoose.model('Review', ReviewSchema);

const ReviewWrapper = new Proxy(ReviewModel, {
  get(target, prop, receiver) {
    if (global.useMockDb) {
      const { mockDbHelper } = require('../config/mockDbHelper');
      if (prop === 'find') return (q) => mockDbHelper.find('reviews', q);
      if (prop === 'findOne') return (q) => mockDbHelper.findOne('reviews', q);
      if (prop === 'findById') return (id) => mockDbHelper.findById('reviews', id);
      if (prop === 'create') return (data) => mockDbHelper.create('reviews', data);
      if (prop === 'findByIdAndDelete') return (id) => mockDbHelper.findByIdAndDelete('reviews', id);
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = ReviewWrapper;
