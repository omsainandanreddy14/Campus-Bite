const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Payment', 'Deposit', 'Withdrawal'],
    required: true
  },
  orderId: {
    type: String
  },
  student: {
    type: String
  },
  canteen: {
    type: String
  },
  deliveryBoy: {
    type: String
  },
  targetUser: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  canteenShare: {
    type: Number
  },
  deliveryShare: {
    type: Number
  },
  adminShare: {
    type: Number
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TransactionModel = mongoose.model('Transaction', TransactionSchema);

const TransactionWrapper = new Proxy(TransactionModel, {
  get(target, prop, receiver) {
    if (global.useMockDb) {
      const { mockDbHelper } = require('../config/mockDbHelper');
      if (prop === 'find') return (q) => mockDbHelper.find('transactions', q);
      if (prop === 'findOne') return (q) => mockDbHelper.findOne('transactions', q);
      if (prop === 'findById') return (id) => mockDbHelper.findById('transactions', id);
      if (prop === 'create') return (data) => mockDbHelper.create('transactions', data);
      if (prop === 'findByIdAndDelete') return (id) => mockDbHelper.findByIdAndDelete('transactions', id);
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = TransactionWrapper;
