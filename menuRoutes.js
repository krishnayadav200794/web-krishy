const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getMenu,
  getMenuAdmin,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');

const router = express.Router();

router.get('/', getMenu); // public
router.get('/admin', protect, authorize('owner', 'staff'), getMenuAdmin);
router.post('/', protect, authorize('owner', 'staff'), createMenuItem);
router.put('/:id', protect, authorize('owner', 'staff'), updateMenuItem);
router.delete('/:id', protect, authorize('owner'), deleteMenuItem);

module.exports = router;
