const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   GET api/orders
// @desc    Get all orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// @route   POST api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  const { customer, address, phone, items, subtotal, total, canteen, paymentMethod, cookingInstructions, courierTip } = req.body;

  try {
    const orderId = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateStr = now.toISOString().split('T')[0];

    const order = await Order.create({
      id: orderId,
      customer,
      address,
      phone,
      items,
      subtotal,
      total: total !== undefined ? total : (subtotal + 10.00 + 30.00 + (courierTip || 0)),
      status: 'Pending',
      time: timeStr,
      date: dateStr,
      canteen,
      paymentMethod: paymentMethod || 'Wallet',
      cookingInstructions: cookingInstructions || '',
      courierTip: courierTip || 0
    });

    res.status(201).json({ success: true, orderId: order.id, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findOne({ id: req.params.id });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (req.user.role === 'delivery') {
      if (status === 'Accepted') {
        if (order.status !== 'Ready for Pickup') {
          return res.status(400).json({ success: false, error: 'Order is no longer available for pickup' });
        }
        if (order.deliveryBoy && order.deliveryBoy !== req.user.name) {
          return res.status(400).json({ success: false, error: 'Order has already been accepted by another rider' });
        }

        const activeCount = await Order.countDocuments({
          deliveryBoy: req.user.name,
          status: { $in: ['Accepted', 'Out for Delivery', 'Payment Pending'] }
        });
        if (activeCount >= 2) {
          return res.status(400).json({ success: false, error: 'You can accept a maximum of 2 active orders at a time.' });
        }

        order.deliveryBoy = req.user.name;
      } else if (status === 'Out for Delivery') {
        if (order.status !== 'Accepted') {
          return res.status(400).json({ success: false, error: 'Order must be accepted before marking it picked up' });
        }
        if (order.deliveryBoy !== req.user.name) {
          return res.status(403).json({ success: false, error: 'You are not the assigned rider for this order' });
        }
      } else {
        if (order.deliveryBoy && order.deliveryBoy !== req.user.name) {
          return res.status(403).json({ success: false, error: 'You are not authorized for this order' });
        }
      }
    }
    
    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST api/orders/:id/pay
// @desc    Process wallet payment for order and split money
// @access  Private
router.post('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.status !== 'Payment Pending') {
      return res.status(400).json({ success: false, error: 'Order is not pending payment' });
    }

    const User = require('../models/User');
    const student = await User.findOne({ name: order.customer, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student user not found' });
    }

    // Wallet Payment Validation & Deduction
    if (student.wallet < order.total) {
      return res.status(400).json({ success: false, error: 'Insufficient wallet balance' });
    }
    student.wallet = parseFloat((student.wallet - order.total).toFixed(2));
    await student.save();

    // 1. Canteen Owner: Dish cost = order.subtotal
    const canteenOwner = await User.findOne({
      name: { $regex: new RegExp('^' + order.canteen + '$', 'i') },
      role: 'canteen'
    });
    if (canteenOwner) {
      canteenOwner.wallet = parseFloat((canteenOwner.wallet + order.subtotal).toFixed(2));
      await canteenOwner.save();
    }

    // 2. Delivery Boy: ₹20.00
    if (order.deliveryBoy) {
      const deliveryBoy = await User.findOne({
        name: { $regex: new RegExp('^' + order.deliveryBoy + '$', 'i') },
        role: 'delivery'
      });
      if (deliveryBoy) {
        deliveryBoy.wallet = parseFloat((deliveryBoy.wallet + 20.00).toFixed(2));
        await deliveryBoy.save();
      }
    }

    // 3. Admin: gets Platform Fee + Rest of Delivery Fee = total - subtotal - 20.00
    const adminShare = parseFloat((order.total - order.subtotal - 20.00).toFixed(2));
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      admin.wallet = parseFloat((admin.wallet + adminShare).toFixed(2));
      await admin.save();
    }

    // Update order status to Delivered
    order.status = 'Delivered';
    await order.save();

    // Create a transaction record for auditing!
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      type: 'Payment',
      orderId: order.id,
      student: student.name,
      canteen: order.canteen,
      deliveryBoy: order.deliveryBoy || 'N/A',
      amount: order.total,
      canteenShare: order.subtotal,
      deliveryShare: 20.00,
      adminShare: adminShare,
      description: `Payment for order ${order.id}: Canteen gets ₹${order.subtotal.toFixed(2)}, Courier gets ₹20.00, Admin gets ₹${adminShare.toFixed(2)}`
    });

    res.json({ success: true, message: 'Payment completed successfully and funds distributed!', order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST api/orders/:id/messages
// @desc    Add message to order chat
// @access  Private
router.post('/:id/messages', protect, async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ success: false, error: 'Message text cannot be empty' });
  }

  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Ensure only the student customer or the assigned delivery boy can send messages
    const isStudent = req.user.role === 'student' && order.customer.toLowerCase() === req.user.name.toLowerCase();
    const isDelivery = req.user.role === 'delivery' && order.deliveryBoy && order.deliveryBoy.toLowerCase() === req.user.name.toLowerCase();

    if (!isStudent && !isDelivery) {
      return res.status(403).json({ success: false, error: 'You are not authorized to message in this order' });
    }

    const newMessage = {
      sender: req.user.name,
      role: req.user.role,
      text: text.trim(),
      createdAt: new Date()
    };

    if (!order.messages) {
      order.messages = [];
    }

    order.messages.push(newMessage);
    await order.save();

    res.json({ success: true, messages: order.messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST api/orders/:id/rate-rider
// @desc    Rate delivery boy / courier rider
// @access  Private (Student only)
router.post('/:id/rate-rider', protect, async (req, res) => {
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, error: 'Please provide a valid rating between 1 and 5' });
  }

  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can submit rider reviews' });
    }

    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!order.deliveryBoy || order.deliveryBoy === 'N/A') {
      return res.status(400).json({ success: false, error: 'No delivery partner assigned to this order yet' });
    }

    const User = require('../models/User');
    const rider = await User.findOne({ name: order.deliveryBoy, role: 'delivery' });
    if (!rider) {
      return res.status(404).json({ success: false, error: 'Courier partner not found' });
    }

    // Update rider average rating (start from 0, not 5.0, so real averages are accurate)
    const currentCount = rider.riderRatingCount || 0;
    const currentRatingSum = (rider.riderRating || 0) * currentCount;
    const newCount = currentCount + 1;
    const newRating = parseFloat(((currentRatingSum + parseFloat(rating)) / newCount).toFixed(2));

    rider.riderRating = newRating;
    rider.riderRatingCount = newCount;
    await rider.save();

    order.isRiderReviewed = true;
    await order.save();

    res.json({ success: true, message: 'Courier partner rated successfully!', riderRating: rider.riderRating, riderRatingCount: rider.riderRatingCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
