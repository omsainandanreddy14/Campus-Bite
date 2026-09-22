const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6
  },
  role: {
    type: String,
    required: [true, 'Please select a role'],
    enum: ['student', 'canteen', 'delivery', 'admin'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  },
  kitchenStatus: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },
  wallet: {
    type: Number,
    default: 0.00
  },
  announcement: {
    type: String,
    default: ''
  },
  specialDishId: {
    type: String,
    default: ''
  },
  specialDishPrice: {
    type: Number,
    default: 0
  },
  customSpecialDishName: {
    type: String,
    default: ''
  },
  customSpecialDishPrice: {
    type: Number,
    default: 0
  },
  specialDishes: {
    type: [{
      dishId: { type: String, default: '' },
      dishPrice: { type: Number, default: 0 },
      customName: { type: String, default: '' },
      customPrice: { type: Number, default: 0 }
    }],
    default: []
  },
  riderRating: {
    type: Number,
    default: 5.00
  },
  riderRatingCount: {
    type: Number,
    default: 0
  },
  hostel: {
    type: String,
    default: ''
  },
  room: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model('User', UserSchema);

const UserWrapper = new Proxy(UserModel, {
  get(target, prop, receiver) {
    if (global.useMockDb) {
      const { mockDbHelper } = require('../config/mockDbHelper');
      if (prop === 'find') return (q) => mockDbHelper.find('users', q);
      if (prop === 'findOne') return (q) => mockDbHelper.findOne('users', q);
      if (prop === 'findById') return (id) => mockDbHelper.findById('users', id);
      if (prop === 'create') return (data) => mockDbHelper.create('users', data);
      if (prop === 'findByIdAndDelete') return (id) => mockDbHelper.findByIdAndDelete('users', id);
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = UserWrapper;
