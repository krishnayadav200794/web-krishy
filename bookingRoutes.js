const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.post('/', createBooking); // public - website booking form
router.get('/', protect, authorize('owner', 'staff'), getBookings);
router.patch('/:id', protect, authorize('owner', 'staff'), updateBookingStatus);
router.delete('/:id', protect, authorize('owner'), deleteBooking);

module.exports = router;
