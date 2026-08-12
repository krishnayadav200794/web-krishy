const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc  Log in owner or staff
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !user.isActive || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    token: generateToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc  Owner creates a staff account
// @route POST /api/auth/staff
// @access Private (owner only)
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error('A user with this email already exists');
  }

  const staff = await User.create({ name, email, password, phone, role: 'staff' });

  res.status(201).json({
    success: true,
    user: { id: staff._id, name: staff.name, email: staff.email, role: staff.role },
  });
});

// @desc  List all staff accounts (owner only)
// @route GET /api/auth/staff
// @access Private (owner only)
const listStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: 'staff' }).select('-password');
  res.json({ success: true, data: staff });
});

// @desc  Activate / deactivate a staff account
// @route PATCH /api/auth/staff/:id
// @access Private (owner only)
const updateStaffStatus = asyncHandler(async (req, res) => {
  const staff = await User.findById(req.params.id);
  if (!staff || staff.role !== 'staff') {
    res.status(404);
    throw new Error('Staff account not found');
  }
  if (typeof req.body.isActive === 'boolean') staff.isActive = req.body.isActive;
  await staff.save();
  res.json({ success: true, data: { id: staff._id, isActive: staff.isActive } });
});

// @desc  Get currently logged-in user profile
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = { login, createStaff, listStaff, updateStaffStatus, getMe };
