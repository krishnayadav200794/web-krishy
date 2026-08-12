const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['North Indian', 'South Indian', 'Chinese', 'Punjabi', 'Snacks', 'Beverages', 'Thali'],
    },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    isAvailable: { type: Boolean, default: true },
    isTodaysSpecial: { type: Boolean, default: false },
    spiceLevel: { type: String, enum: ['mild', 'medium', 'hot'], default: 'medium' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
