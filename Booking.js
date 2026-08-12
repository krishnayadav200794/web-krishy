const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    guests: { type: Number, required: true, min: 1, max: 50 },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm (24h)
    specialRequest: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    source: { type: String, enum: ['website', 'whatsapp', 'phone'], default: 'website' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    staffNote: { type: String, trim: true, default: '' },
    remindersSent: {
      dayBefore: { type: Boolean, default: false },
      twoHourBefore: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ date: 1, time: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
