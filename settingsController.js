const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');

// @desc  Get restaurant settings (creates defaults on first call)
// @route GET /api/settings
// @access Private (staff, owner) - also used internally
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ success: true, data: settings });
});

// @desc  Update restaurant settings
// @route PUT /api/settings
// @access Private (owner only)
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  const { openingHours, slotCapacity, slotIntervalMinutes, isAcceptingBookings } = req.body;

  if (openingHours) settings.openingHours = openingHours;
  if (slotCapacity !== undefined) settings.slotCapacity = slotCapacity;
  if (slotIntervalMinutes !== undefined) settings.slotIntervalMinutes = slotIntervalMinutes;
  if (isAcceptingBookings !== undefined) settings.isAcceptingBookings = isAcceptingBookings;

  await settings.save();
  res.json({ success: true, data: settings });
});

module.exports = { getSettings, updateSettings };
