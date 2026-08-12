const mongoose = require('mongoose');

const partyBookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    budget: { type: String, trim: true, default: '' },
    eventType: { type: String, trim: true, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    staffNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PartyBooking', partyBookingSchema);
