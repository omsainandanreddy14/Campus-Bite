const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a food name'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  img: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Biryani', 'Burgers', 'Pizza', 'Drinks', 'Desserts', 'Snacks']
  },
  available: {
    type: Boolean,
    default: true
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  canteen: {
    type: String,
    required: [true, 'Please specify the canteen stand']
  },
  rating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  stockQuantity: {
    type: Number,
    default: 15
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FoodModel = mongoose.model('Food', FoodSchema);

const FoodWrapper = new Proxy(FoodModel, {
  get(target, prop, receiver) {
    if (global.useMockDb) {
      const { mockDbHelper } = require('../config/mockDbHelper');
      if (prop === 'find') return (q) => mockDbHelper.find('foods', q);
      if (prop === 'findOne') return (q) => mockDbHelper.findOne('foods', q);
      if (prop === 'findById') return (id) => mockDbHelper.findById('foods', id);
      if (prop === 'create') return (data) => mockDbHelper.create('foods', data);
      if (prop === 'findByIdAndDelete') return (id) => mockDbHelper.findByIdAndDelete('foods', id);
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = FoodWrapper;
