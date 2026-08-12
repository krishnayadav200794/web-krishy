const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { buildWaLink } = require('../utils/whatsapp');

// @desc  Place a food order (public site cart checkout)
// @route POST /api/orders
// @access Public
const createOrder = asyncHandler(async (req, res) => {
  const { customerName, phone, items, deliveryAddress, orderType } = req.body;

  if (!customerName || !phone || !deliveryAddress || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Name, phone, delivery address and at least one item are required');
  }

  // Never trust prices/quantities sent from the client - re-price every
  // line item against the live menu so a tampered request can't undercharge.
  const menuIds = items.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({ _id: { $in: menuIds }, isAvailable: true });
  const menuMap = new Map(menuItems.map((m) => [String(m._id), m]));

  const orderItems = items.map((i) => {
    const menuItem = menuMap.get(i.menuItemId);
    if (!menuItem) {
      res.status(400);
      throw new Error(`Menu item ${i.menuItemId} is unavailable or does not exist`);
    }
    const quantity = Math.max(1, parseInt(i.quantity, 10) || 1);
    return { menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity };
  });

  const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await Order.create({
    customerName,
    phone,
    items: orderItems,
    totalAmount,
    deliveryAddress,
    orderType: orderType === 'pickup' ? 'pickup' : 'delivery',
  });

  const summary = orderItems.map((i) => `${i.quantity}x ${i.name}`).join(', ');
  const restaurantMsg =
    `New Food Order\nCustomer: ${customerName}\nPhone: ${phone}\n` +
    `Items: ${summary}\nTotal: Rs.${totalAmount}\nType: ${order.orderType}\n` +
    (order.orderType === 'delivery' ? `Address: ${deliveryAddress}` : '');

  res.status(201).json({
    success: true,
    data: order,
    whatsappLinks: {
      notifyRestaurant: buildWaLink(process.env.RESTAURANT_WHATSAPP_NUMBER, restaurantMsg),
    },
  });
});

// @desc  List orders (optionally by status)
// @route GET /api/orders
// @access Private (staff, owner)
const getOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc  Update order status / prep time
// @route PATCH /api/orders/:id
// @access Private (staff, owner)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, estimatedPrepMinutes, staffNote } = req.body;
  const allowed = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'];

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (status) {
    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error(`Status must be one of: ${allowed.join(', ')}`);
    }
    order.status = status;
  }
  if (estimatedPrepMinutes !== undefined) order.estimatedPrepMinutes = estimatedPrepMinutes;
  if (staffNote !== undefined) order.staffNote = staffNote;

  await order.save();
  res.json({ success: true, data: order });
});

module.exports = { createOrder, getOrders, updateOrderStatus };
