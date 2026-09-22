const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role, hostel, room, phone, address } = req.body;

  try {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const userExists = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });

    if (userExists) {
      return res.status(400).json({ success: false, error: 'An account with this email is already created. Please log in instead!' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      hostel: hostel || '',
      room: room || '',
      phone: phone || '',
      address: address || ''
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          wallet: user.wallet,
          status: user.status || 'Active',
          kitchenStatus: user.kitchenStatus,
          hostel: user.hostel,
          room: user.room,
          phone: user.phone,
          address: user.address,
          announcement: user.announcement || '',
          specialDishId: user.specialDishId || '',
          specialDishPrice: user.specialDishPrice || 0,
          customSpecialDishName: user.customSpecialDishName || '',
          customSpecialDishPrice: user.customSpecialDishPrice || 0,
          riderRating: user.riderRating || 0,
          riderRatingCount: user.riderRatingCount || 0,
          specialDishes: user.specialDishes || []
        }
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'Suspended') {
        return res.status(403).json({ success: false, error: 'Your account has been suspended by the administrator.' });
      }
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          wallet: user.wallet,
          status: user.status || 'Active',
          kitchenStatus: user.kitchenStatus,
          hostel: user.hostel || '',
          room: user.room || '',
          phone: user.phone || '',
          address: user.address || '',
          announcement: user.announcement || '',
          specialDishId: user.specialDishId || '',
          specialDishPrice: user.specialDishPrice || 0,
          customSpecialDishName: user.customSpecialDishName || '',
          customSpecialDishPrice: user.customSpecialDishPrice || 0,
          riderRating: user.riderRating || 0,
          riderRatingCount: user.riderRatingCount || 0,
          specialDishes: user.specialDishes || []
        }
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET api/auth/me
// @desc    Get current user details
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        wallet: req.user.wallet,
        status: req.user.status || 'Active',
        kitchenStatus: req.user.kitchenStatus,
        hostel: req.user.hostel || '',
        room: req.user.room || '',
        phone: req.user.phone || '',
        address: req.user.address || '',
        announcement: req.user.announcement || '',
        specialDishId: req.user.specialDishId || '',
        specialDishPrice: req.user.specialDishPrice || 0,
        customSpecialDishName: req.user.customSpecialDishName || '',
        customSpecialDishPrice: req.user.customSpecialDishPrice || 0,
        riderRating: req.user.riderRating || 0,
        riderRatingCount: req.user.riderRatingCount || 0,
        specialDishes: req.user.specialDishes || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET api/auth/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT api/auth/users/:id/status
// @desc    Toggle user status (Admin only)
// @access  Private (Admin)
router.put('/users/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    user.status = user.status === 'Active' ? 'Suspended' : 'Active';
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE api/auth/users/:id
// @desc    Delete user account (Admin only)
// @access  Private (Admin)
router.delete('/users/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET api/auth/canteens
// @desc    Get all canteens and their statuses (Public)
// @access  Public
router.get('/canteens', async (req, res) => {
  try {
    const canteens = await User.find({ role: 'canteen' }).select('name status kitchenStatus announcement specialDishId specialDishPrice customSpecialDishName customSpecialDishPrice specialDishes');
    res.json({ success: true, canteens });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT api/auth/users/kitchen-status
// @desc    Update kitchen status (Open/Closed) for canteen owners
// @access  Private (Canteen)
router.put('/users/kitchen-status', protect, async (req, res) => {
  try {
    let targetId = req.user._id;
    if (req.body.userId && req.user.role === 'admin') {
      targetId = req.body.userId;
    } else if (req.user.role !== 'canteen' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Check if account is suspended by Admin
    if (user.status === 'Suspended' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Your canteen account is Suspended by Admin. Contact admin to reactivate.' });
    }

    // Toggle or set kitchen status
    const newStatus = req.body.kitchenStatus;
    if (newStatus && ['Open', 'Closed'].includes(newStatus)) {
      user.kitchenStatus = newStatus;
    } else {
      user.kitchenStatus = user.kitchenStatus === 'Open' ? 'Closed' : 'Open';
    }
    
    await user.save();
    res.json({
      success: true,
      kitchenStatus: user.kitchenStatus,
      status: user.status,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'Active',
        kitchenStatus: user.kitchenStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST api/auth/users/:id/add-wallet
// @desc    Add money to user's wallet (Admin only)
// @access  Private (Admin)
router.post('/users/:id/add-wallet', protect, async (req, res) => {
  const { amount } = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid positive amount' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.wallet = parseFloat((user.wallet + parseFloat(amount)).toFixed(2));
    await user.save();

    // Create a transaction record for auditing!
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      type: 'Deposit',
      targetUser: user.name,
      amount: parseFloat(amount),
      description: `Admin deposit of ₹${parseFloat(amount).toFixed(2)}`
    });

    res.json({ success: true, message: `Successfully added ₹${parseFloat(amount).toFixed(2)} to ${user.name}'s wallet.`, wallet: user.wallet });
  } catch (error) {
    res.status(550).json({ success: false, error: error.message });
  }
});

// @route   POST api/auth/wallet/deposit
// @desc    Deposit money into user's wallet
// @access  Private
router.post('/wallet/deposit', protect, async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ success: false, error: 'Please enter a valid deposit amount' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.wallet = parseFloat((user.wallet + parseFloat(amount)).toFixed(2));
    await user.save();

    // Log the transaction
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      type: 'Deposit',
      targetUser: user.name,
      amount: parseFloat(amount),
      description: `Wallet Deposit: ₹${parseFloat(amount).toFixed(2)} added to ${user.name}'s wallet`
    });

    res.json({ success: true, message: 'Deposit successful!', wallet: user.wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST api/auth/wallet/withdraw
// @desc    Withdraw money from user's wallet
// @access  Private
router.post('/wallet/withdraw', protect, async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ success: false, error: 'Please enter a valid withdrawal amount' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.wallet < parseFloat(amount)) {
      return res.status(400).json({ success: false, error: 'Insufficient wallet balance' });
    }

    user.wallet = parseFloat((user.wallet - parseFloat(amount)).toFixed(2));
    await user.save();

    // Log the transaction
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      type: 'Withdrawal',
      targetUser: user.name,
      amount: parseFloat(amount),
      description: `Wallet Withdrawal: ₹${parseFloat(amount).toFixed(2)} withdrawn from ${user.name}'s wallet`
    });

    res.json({ success: true, message: 'Withdrawal successful!', wallet: user.wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET api/auth/wallet/transactions
// @desc    Get transaction history for logged-in user
// @access  Private
router.get('/wallet/transactions', protect, async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    // Find transactions: admins see all transactions, others see only transactions involving them
    let query = {};
    if (req.user.role !== 'admin') {
      query = {
        $or: [
          { targetUser: req.user.name },
          { student: req.user.name },
          { canteen: req.user.name },
          { deliveryBoy: req.user.name }
        ]
      };
    }
    
    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT api/auth/users/announcement
// @desc    Update canteen daily announcement banner
// @access  Private (Canteen only)
router.put('/users/announcement', protect, async (req, res) => {
  const { announcement, specialDishId, specialDishPrice, customSpecialDishName, customSpecialDishPrice, specialDishes } = req.body;

  try {
    if (req.user.role !== 'canteen') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.announcement = announcement !== undefined ? announcement.trim() : '';

    if (specialDishes !== undefined) {
      user.specialDishes = specialDishes;
      if (user.specialDishes.length > 0) {
        const first = user.specialDishes[0];
        user.specialDishId = first.dishId || '';
        user.specialDishPrice = first.dishPrice || 0;
        user.customSpecialDishName = first.customName || '';
        user.customSpecialDishPrice = first.customPrice || 0;
      } else {
        user.specialDishId = '';
        user.specialDishPrice = 0;
        user.customSpecialDishName = '';
        user.customSpecialDishPrice = 0;
      }
    } else {
      user.specialDishId = specialDishId !== undefined ? specialDishId : '';
      user.specialDishPrice = specialDishPrice !== undefined ? parseFloat(specialDishPrice) : 0;
      user.customSpecialDishName = customSpecialDishName !== undefined ? customSpecialDishName.trim() : '';
      user.customSpecialDishPrice = customSpecialDishPrice !== undefined ? parseFloat(customSpecialDishPrice) : 0;

      if (user.specialDishId || user.customSpecialDishName) {
        user.specialDishes = [{
          dishId: user.specialDishId,
          dishPrice: user.specialDishPrice,
          customName: user.customSpecialDishName,
          customPrice: user.customSpecialDishPrice
        }];
      } else {
        user.specialDishes = [];
      }
    }

    await user.save();

    res.json({ 
      success: true, 
      message: 'Announcement updated successfully!', 
      announcement: user.announcement,
      specialDishId: user.specialDishId,
      specialDishPrice: user.specialDishPrice,
      customSpecialDishName: user.customSpecialDishName,
      customSpecialDishPrice: user.customSpecialDishPrice,
      specialDishes: user.specialDishes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET api/auth/couriers
// @desc    Get all couriers for leaderboard
// @access  Private (Admin only)
router.get('/couriers', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const couriers = await User.find({ role: 'delivery' }).select('name email status riderRating riderRatingCount');
    res.json({ success: true, couriers });
  } catch (error) {
    res.status(550).json({ success: false, error: error.message });
  }
});

// @route   PUT api/auth/profile
// @desc    Update current user delivery address profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { name, email, hostel, room, phone, address } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim();
    if (hostel !== undefined) user.hostel = hostel.trim();
    if (room !== undefined) user.room = room.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet,
        kitchenStatus: user.kitchenStatus,
        hostel: user.hostel,
        room: user.room,
        phone: user.phone,
        address: user.address,
        announcement: user.announcement || '',
        specialDishId: user.specialDishId || '',
        specialDishPrice: user.specialDishPrice || 0,
        customSpecialDishName: user.customSpecialDishName || '',
        customSpecialDishPrice: user.customSpecialDishPrice || 0,
        riderRating: user.riderRating || 0,
        riderRatingCount: user.riderRatingCount || 0,
        specialDishes: user.specialDishes || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT api/auth/users/:id
// @desc    Update any user account profile (Admin only)
// @access  Private (Admin)
router.put('/users/:id', protect, async (req, res) => {
  const { name, email, role, wallet, status, hostel, room, phone, announcement, specialDishId, specialDishPrice, customSpecialDishName, customSpecialDishPrice, specialDishes } = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim();
    if (role !== undefined) user.role = role;
    if (wallet !== undefined) user.wallet = parseFloat(wallet);
    if (status !== undefined) user.status = status;
    if (hostel !== undefined) user.hostel = hostel.trim();
    if (room !== undefined) user.room = room.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (announcement !== undefined) user.announcement = announcement.trim();

    if (specialDishes !== undefined) {
      user.specialDishes = specialDishes;
      if (user.specialDishes.length > 0) {
        const first = user.specialDishes[0];
        user.specialDishId = first.dishId || '';
        user.specialDishPrice = first.dishPrice || 0;
        user.customSpecialDishName = first.customName || '';
        user.customSpecialDishPrice = first.customPrice || 0;
      } else {
        user.specialDishId = '';
        user.specialDishPrice = 0;
        user.customSpecialDishName = '';
        user.customSpecialDishPrice = 0;
      }
    } else {
      if (specialDishId !== undefined) user.specialDishId = specialDishId;
      if (specialDishPrice !== undefined) user.specialDishPrice = parseFloat(specialDishPrice);
      if (customSpecialDishName !== undefined) user.customSpecialDishName = customSpecialDishName.trim();
      if (customSpecialDishPrice !== undefined) user.customSpecialDishPrice = parseFloat(customSpecialDishPrice);

      if (user.specialDishId || user.customSpecialDishName) {
        user.specialDishes = [{
          dishId: user.specialDishId,
          dishPrice: user.specialDishPrice,
          customName: user.customSpecialDishName,
          customPrice: user.customSpecialDishPrice
        }];
      } else {
        user.specialDishes = [];
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'User profile updated successfully!',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
