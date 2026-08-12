const mongoose = require('mongoose');

// Singleton document holding restaurant-wide configuration that the owner
// can edit from the admin dashboard without touching code.
const settingsSchema = new mongoose.Schema(
  {
    openingHours: {
      type: Map,
      of: String, // e.g. { "monday": "11:00-15:00,19:00-23:00" }
      default: {},
    },
    slotCapacity: { type: Number, default: 8 }, // max simultaneous bookings per time slot
    slotIntervalMinutes: { type: Number, default: 30 },
    isAcceptingBookings: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
