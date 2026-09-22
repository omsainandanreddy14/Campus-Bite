const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const { protect } = require('../middleware/auth');

// @route   GET api/vouchers
// @desc    Get all active vouchers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const vouchers = await Voucher.find({ isActive: true });
    res.json({ success: true, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST api/vouchers
// @desc    Create new discount voucher
// @access  Private (Admin or Canteen Owner)
router.post('/', protect, async (req, res) => {
  const { code, discount, minCartValue, description, canteen, category } = req.body;

  try {
    if (req.user.role !== 'admin' && req.user.role !== 'canteen') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (!code || !discount || isNaN(discount) || parseFloat(discount) <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid code and positive discount percentage.' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if voucher code already exists
    const existing = await Voucher.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Voucher code already exists.' });
    }

    const voucher = await Voucher.create({
      code: cleanCode,
      discount: parseFloat(discount),
      minCartValue: parseFloat(minCartValue) || 0,
      description: description ? description.trim() : '',
      canteen: req.user.role === 'admin' ? (canteen || '') : req.user.name, // Bind to canteen if created by owner, or use selected target if admin
      category: category || 'All',
      isActive: true
    });

    res.status(201).json({ success: true, voucher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT api/vouchers/:id
// @desc    Update voucher settings or excluded canteens
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Admin only.' });
    }

    const { excludedCanteens, isActive, description, minCartValue } = req.body;
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, error: 'Voucher not found' });
    }

    if (excludedCanteens !== undefined) voucher.excludedCanteens = excludedCanteens;
    if (isActive !== undefined) voucher.isActive = isActive;
    if (description !== undefined) voucher.description = description;
    if (minCartValue !== undefined) voucher.minCartValue = minCartValue;

    await voucher.save();
    res.json({ success: true, voucher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE api/vouchers/:id
// @desc    Delete a voucher
// @access  Private (Admin or Canteen Owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, error: 'Voucher not found' });
    }

    // Admins can delete anything; canteen owners can only delete their own vouchers
    if (req.user.role !== 'admin' && (req.user.role !== 'canteen' || voucher.canteen !== req.user.name)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Voucher deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
