const asyncHandler = require('express-async-handler');
const PartyBooking = require('../models/PartyBooking');
const { partyBookingNotificationForRestaurant } = require('../utils/whatsapp');

// @desc  Create a party hall enquiry (public form)
// @route POST /api/party-bookings
// @access Public
const createPartyBooking = asyncHandler(async (req, res) => {
  const { name, phone, date, guests, budget, eventType } = req.body;

  if (!name || !phone || !date || !guests || !eventType) {
    res.status(400);
    throw new Error('Name, phone, date, guests and event type are required');
  }

  const party = await PartyBooking.create({ name, phone, date, guests, budget, eventType });

  res.status(201).json({
    success: true,
    data: party,
    whatsappLinks: { notifyRestaurant: partyBookingNotificationForRestaurant(party) },
  });
});

// @desc  List party enquiries
// @route GET /api/party-bookings
// @access Private (staff, owner)
const getPartyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const bookings = await PartyBooking.find(filter).sort({ date: 1 });
  res.json({ success: true, count: bookings.length, data: bookings });
});

// @desc  Update party enquiry status
// @route PATCH /api/party-bookings/:id
// @access Private (staff, owner)
const updatePartyBookingStatus = asyncHandler(async (req, res) => {
  const { status, staffNote } = req.body;
  const allowed = ['pending', 'confirmed', 'rejected', 'cancelled'];

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(', ')}`);
  }

  const party = await PartyBooking.findById(req.params.id);
  if (!party) {
    res.status(404);
    throw new Error('Party booking not found');
  }

  party.status = status;
  party.reviewedBy = req.user._id;
  if (staffNote !== undefined) party.staffNote = staffNote;
  await party.save();

  res.json({ success: true, data: party });
});

module.exports = { createPartyBooking, getPartyBookings, updatePartyBookingStatus };
