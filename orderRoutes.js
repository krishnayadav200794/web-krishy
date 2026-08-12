const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');

const router = express.Router();

router.post('/', createOrder); // public - cart checkout
router.get('/', protect, authorize('owner', 'staff'), getOrders);
router.patch('/:id', protect, authorize('owner', 'staff'), updateOrderStatus);

module.exports = router;
