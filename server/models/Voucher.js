const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  discount: {
    type: Number,
    required: true
  },
  minCartValue: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  canteen: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'All'
  },
  excludedCanteens: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const VoucherModel = mongoose.model('Voucher', VoucherSchema);

const VoucherWrapper = new Proxy(VoucherModel, {
  get(target, prop, receiver) {
    if (global.useMockDb) {
      const { mockDbHelper } = require('../config/mockDbHelper');
      if (prop === 'find') return (q) => mockDbHelper.find('vouchers', q);
      if (prop === 'findOne') return (q) => mockDbHelper.findOne('vouchers', q);
      if (prop === 'findById') return (id) => mockDbHelper.findById('vouchers', id);
      if (prop === 'create') return (data) => mockDbHelper.create('vouchers', data);
      if (prop === 'findByIdAndDelete') return (id) => mockDbHelper.findByIdAndDelete('vouchers', id);
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = VoucherWrapper;
