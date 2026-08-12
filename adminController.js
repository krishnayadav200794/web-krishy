const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const PartyBooking = require('../models/PartyBooking');

// @desc  Dashboard summary counts for the admin home screen
// @route GET /api/admin/summary
// @access Private (staff, owner)
const getSummary = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const [todayBookings, pendingBookings, pendingParties, totalBookingsThisMonth] =
    await Promise.all([
      Booking.countDocuments({ date: today, status: { $in: ['pending', 'confirmed'] } }),
      Booking.countDocuments({ status: 'pending' }),
      PartyBooking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
    ]);

  res.json({
    success: true,
    data: { todayBookings, pendingBookings, pendingParties, totalBookingsThisMonth },
  });
});

const toCsv = (rows, columns) => {
  const header = columns.join(',');
  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const body = rows
    .map((row) => columns.map((col) => escape(row[col])).join(','))
    .join('\n');
  return `${header}\n${body}`;
};

// @desc  Export all table bookings as CSV
// @route GET /api/admin/export/bookings
// @access Private (owner only)
const exportBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ date: 1, time: 1 }).lean();
  const columns = ['name', 'phone', 'guests', 'date', 'time', 'status', 'specialRequest', 'createdAt'];
  const csv = toCsv(bookings, columns);

  res.header('Content-Type', 'text/csv');
  res.attachment(`bookings-export-${Date.now()}.csv`);
  res.send(csv);
});

module.exports = { getSummary, exportBookings };
