const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getSummary, exportBookings } = require('../controllers/adminController');

const router = express.Router();

router.get('/summary', protect, authorize('owner', 'staff'), getSummary);
router.get('/export/bookings', protect, authorize('owner'), exportBookings);

module.exports = router;
