const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  createOrganizer,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, require('../controllers/authController').updateUserProfile);
router.post('/create-organizer', protect, admin, createOrganizer);

module.exports = router;
