const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, getMe, updateUserProfile, createOrganizer, deleteOrganizer,
  forgotPassword, verifyOtp, resetPassword,
  toggleFollowOrganizer, getAllOrganizers, adminSendEmail, searchParticipants,
  requestPasswordReset, getPendingResets, approvePasswordReset, rejectPasswordReset,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.post('/create-organizer', protect, admin, createOrganizer);
router.delete('/organizer/:id', protect, admin, deleteOrganizer);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Organizers / Clubs
router.get('/organizers', protect, getAllOrganizers);
router.post('/follow/:id', protect, toggleFollowOrganizer);

// Admin email
router.post('/admin/send-email', protect, admin, adminSendEmail);
router.get('/admin/search-participants', protect, admin, searchParticipants);

// Organizer password reset (admin approval flow)
router.post('/organizer/request-password-reset', protect, requestPasswordReset);
router.get('/admin/pending-resets', protect, admin, getPendingResets);
router.post('/admin/approve-reset/:id', protect, admin, approvePasswordReset);
router.post('/admin/reject-reset/:id', protect, admin, rejectPasswordReset);

module.exports = router;
