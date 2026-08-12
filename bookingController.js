const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Settings = require('../models/Settings');
const {
  bookingNotificationForRestaurant,
  bookingConfirmationForCustomer,
} = require('../utils/whatsapp');

const ACTIVE_STATUSES = ['pending', 'confirmed'];

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Finds the next slot on the same date, at or after the requested time,
// that has not yet reached capacity. Checks up to 12 hours ahead.
const findNextAvailableSlot = async (date, requestedTime, capacity, interval) => {
  let cursor = timeToMinutes(requestedTime);
  const limit = cursor + 12 * 60;

  while (cursor <= limit) {
    const candidate = minutesToTime(cursor);
    // eslint-disable-next-line no-await-in-loop
    const count = await Booking.countDocuments({
      date,
      time: candidate,
      status: { $in: ACTIVE_STATUSES },
    });
    if (count < capacity) return candidate;
    cursor += interval;
  }
  return null;
};

// @desc  Create a table booking (public form)
// @route POST /api/bookings
// @access Public
const createBooking = asyncHandler(async (req, res) => {
  const { name, phone, guests, date, time, specialRequest } = req.body;

  if (!name || !phone || !guests || !date || !time) {
    res.status(400);
    throw new Error('Name, phone, guests, date and time are required');
  }

  const settings = await getSettings();

  if (!settings.isAcceptingBookings) {
    res.status(423);
    throw new Error('Online bookings are temporarily paused. Please call the restaurant directly.');
  }

  const currentCount = await Booking.countDocuments({
    date,
    time,
    status: { $in: ACTIVE_STATUSES },
  });

  let finalTime = time;
  let wasRescheduled = false;

  if (currentCount >= settings.slotCapacity) {
    const nextSlot = await findNextAvailableSlot(
      date,
      time,
      settings.slotCapacity,
      settings.slotIntervalMinutes
    );
    if (!nextSlot) {
      res.status(409);
      throw new Error('No slots available on this date. Please try another date.');
    }
    finalTime = nextSlot;
    wasRescheduled = true;
  }

  const booking = await Booking.create({
    name,
    phone,
    guests,
    date,
    time: finalTime,
    specialRequest,
    source: 'website',
  });

  res.status(201).json({
    success: true,
    data: booking,
    wasRescheduled,
    requestedTime: time,
    // Front-end opens these in a new tab so the customer/owner can send
    // the message with one tap - see utils/whatsapp.js for why this isn't
    // sent automatically yet.
    whatsappLinks: {
      notifyRestaurant: bookingNotificationForRestaurant(booking),
      confirmCustomer: bookingConfirmationForCustomer(booking),
    },
  });
});

// @desc  List bookings with optional filters (status, date)
// @route GET /api/bookings
// @access Private (staff, owner)
const getBookings = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (date) filter.date = date;

  const bookings = await Booking.find(filter).sort({ date: 1, time: 1 });
  res.json({ success: true, count: bookings.length, data: bookings });
});

// @desc  Update a booking's status (approve / reject / cancel / complete)
// @route PATCH /api/bookings/:id
// @access Private (staff, owner)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, staffNote } = req.body;
  const allowed = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'];

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(', ')}`);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.status = status;
  booking.reviewedBy = req.user._id;
  if (staffNote !== undefined) booking.staffNote = staffNote;
  await booking.save();

  res.json({
    success: true,
    data: booking,
    whatsappLinks:
      status === 'confirmed'
        ? { confirmCustomer: bookingConfirmationForCustomer(booking) }
        : undefined,
  });
});

// @desc  Delete a booking (owner only, for cleanup/export purposes)
// @route DELETE /api/bookings/:id
// @access Private (owner)
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { createBooking, getBookings, updateBookingStatus, deleteBooking };
