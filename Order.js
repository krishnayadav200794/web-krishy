const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true }, // snapshot at order time, survives menu edits
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryAddress: { type: String, required: true, trim: true },
    orderType: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'],
      default: 'pending',
    },
    estimatedPrepMinutes: { type: Number, default: 30 },
    staffNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
