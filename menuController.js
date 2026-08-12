const asyncHandler = require('express-async-handler');
const MenuItem = require('../models/MenuItem');

// @desc  Get full menu (optionally filtered by category), public site consumes this
// @route GET /api/menu
// @access Public
const getMenu = asyncHandler(async (req, res) => {
  const { category, specialsOnly } = req.query;
  const filter = { isAvailable: true };
  if (category) filter.category = category;
  if (specialsOnly === 'true') filter.isTodaysSpecial = true;

  const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
  res.json({ success: true, count: items.length, data: items });
});

// @desc  Get full menu including unavailable items, for admin management
// @route GET /api/menu/admin
// @access Private (staff, owner)
const getMenuAdmin = asyncHandler(async (req, res) => {
  const items = await MenuItem.find().sort({ category: 1, name: 1 });
  res.json({ success: true, count: items.length, data: items });
});

// @desc  Add a menu item
// @route POST /api/menu
// @access Private (staff, owner)
const createMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.create(req.body);
  res.status(201).json({ success: true, data: item });
});

// @desc  Update a menu item (price, availability, today's special flag, etc.)
// @route PUT /api/menu/:id
// @access Private (staff, owner)
const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  res.json({ success: true, data: item });
});

// @desc  Delete a menu item
// @route DELETE /api/menu/:id
// @access Private (owner)
const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { getMenu, getMenuAdmin, createMenuItem, updateMenuItem, deleteMenuItem };
