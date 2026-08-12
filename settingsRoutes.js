const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');

const router = express.Router();

router.get('/', protect, authorize('owner', 'staff'), getSettings);
router.put('/', protect, authorize('owner'), updateSettings);

module.exports = router;
