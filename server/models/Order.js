const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  canteen: {
    type: String,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Preparing', 'Ready for Pickup', 'Accepted', 'Out for Delivery', 'Payment Pending', 'Delivered', 'Rejected'],
    default: 'Pending'
  },
  deliveryBoy: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['Wallet', 'COD'],
    default: 'Wallet'
  },
  cookingInstructions: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  canteen: {
    type: String,
    required: true
  },
  messages: [
    {
      sender: String,
      role: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  isReviewed: {
    type: Boolean,
    default: false
  },
  isRiderReviewed: {
    type: Boolean,
    default: false
  },
  courierTip: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const OrderModel = mongoose.model('Order', OrderSchema);

const OrderWrapper = new Proxy(OrderModel, {
  get(target, prop, receiver) {
    if (global.useMockDb) {
      const { mockDbHelper } = require('../config/mockDbHelper');
      if (prop === 'find') return (q) => mockDbHelper.find('orders', q);
      if (prop === 'findOne') return (q) => mockDbHelper.findOne('orders', q);
      if (prop === 'findById') return (id) => mockDbHelper.findById('orders', id);
      if (prop === 'create') return (data) => mockDbHelper.create('orders', data);
      if (prop === 'findByIdAndDelete') return (id) => mockDbHelper.findByIdAndDelete('orders', id);
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = OrderWrapper;
