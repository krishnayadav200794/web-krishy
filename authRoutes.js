const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  login,
  createStaff,
  listStaff,
  updateStaffStatus,
  getMe,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);

// Owner-only staff management
router.post('/staff', protect, authorize('owner'), createStaff);
router.get('/staff', protect, authorize('owner'), listStaff);
router.patch('/staff/:id', protect, authorize('owner'), updateStaffStatus);

module.exports = router;
