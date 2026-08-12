const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createPartyBooking,
  getPartyBookings,
  updatePartyBookingStatus,
} = require('../controllers/partyBookingController');

const router = express.Router();

router.post('/', createPartyBooking); // public - party enquiry form
router.get('/', protect, authorize('owner', 'staff'), getPartyBookings);
router.patch('/:id', protect, authorize('owner', 'staff'), updatePartyBookingStatus);

module.exports = router;
