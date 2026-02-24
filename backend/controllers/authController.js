const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

const IIIT_DOMAINS = ['@students.iiit.ac.in', '@research.iiit.ac.in', '@iiit.ac.in'];

// @desc    Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error('Please include email and password'); }
  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  const role = (req.body.role === 'organizer') ? 'organizer' : 'participant';
  const userData = { email, password, role };

  if (role === 'participant') {
    userData.firstName = req.body.firstName || '';
    userData.lastName = req.body.lastName || '';
    userData.participantType = req.body.participantType || 'external';
    userData.collegeName = req.body.collegeName || '';
    userData.contactNumber = req.body.contactNumber || '';
    userData.genres = req.body.genres || [];
    userData.name = `${userData.firstName} ${userData.lastName}`.trim();
    userData.isIIIT = userData.participantType === 'iiit';

    // IIIT email domain validation
    if (userData.participantType === 'iiit') {
      const isValidDomain = IIIT_DOMAINS.some(d => email.toLowerCase().endsWith(d));
      if (!isValidDomain) {
        res.status(400);
        throw new Error('IIIT participants must use @students.iiit.ac.in, @research.iiit.ac.in, or @iiit.ac.in email addresses');
      }
    }
  } else {
    userData.organizerName = req.body.organizerName || '';
    userData.category = req.body.category || '';
    userData.description = req.body.description || '';
    userData.contactEmail = req.body.contactEmail || email;
    userData.name = userData.organizerName;
  }

  const user = await User.create(userData);
  if (user) {
    res.status(201).json({ ...buildUserResponse(user), token: generateToken(user._id) });
  } else {
    res.status(400); throw new Error('Invalid user data');
  }
});

// @desc    Login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.status(200).json({ ...buildUserResponse(user), token: generateToken(user._id) });
  } else {
    res.status(401); throw new Error('Invalid credentials');
  }
});

// @desc    Get me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(buildUserResponse(req.user));
});

// @desc    Update profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  if (req.body.email && req.body.email !== user.email) {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) { res.status(400); throw new Error('Email already in use'); }
    user.email = req.body.email;
  }
  if (req.body.password) user.password = req.body.password;
  if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
  if (req.body.lastName !== undefined) user.lastName = req.body.lastName;
  if (req.body.participantType !== undefined) user.participantType = req.body.participantType;
  if (req.body.collegeName !== undefined) user.collegeName = req.body.collegeName;
  if (req.body.contactNumber !== undefined) user.contactNumber = req.body.contactNumber;
  if (req.body.genres) user.genres = req.body.genres;
  if (req.body.organizerName !== undefined) user.organizerName = req.body.organizerName;
  if (req.body.category !== undefined) user.category = req.body.category;
  if (req.body.description !== undefined) user.description = req.body.description;
  if (req.body.contactEmail !== undefined) user.contactEmail = req.body.contactEmail;

  if (user.role === 'participant') {
    user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    user.isIIIT = user.participantType === 'iiit';
  } else if (user.role === 'organizer') {
    user.name = user.organizerName || user.name;
  }

  const updated = await user.save();
  res.status(200).json({ ...buildUserResponse(updated), token: generateToken(updated._id) });
});

// @desc    Create Organizer (Admin only)
const createOrganizer = asyncHandler(async (req, res) => {
  const { organizerName, email, password, category, description, contactEmail } = req.body;
  if (!organizerName || !email || !password) { res.status(400); throw new Error('organizerName, email, and password are required'); }
  const exists = await User.findOne({ email });
  if (exists) { res.status(400); throw new Error('User already exists'); }
  const user = await User.create({
    email, password, role: 'organizer',
    organizerName, name: organizerName,
    category: category || '', description: description || '',
    contactEmail: contactEmail || email,
  });
  if (user) {
    res.status(201).json({ _id: user._id, organizerName: user.organizerName, email: user.email, role: user.role, category: user.category, description: user.description, contactEmail: user.contactEmail });
  } else { res.status(400); throw new Error('Invalid user data'); }
});

// @desc    Delete Organizer (Admin only)
const deleteOrganizer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('Organizer not found'); }
  if (user.role !== 'organizer') { res.status(400); throw new Error('User is not an organizer'); }
  const Event = require('../models/Event');
  await Event.deleteMany({ organizer: user._id });
  await user.deleteOne();
  res.status(200).json({ message: 'Organizer and their events deleted', id: req.params.id });
});

// @desc    Forgot password - send OTP
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) { res.status(404); throw new Error('No account with that email'); }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetOtp = otp;
  user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail(email, 'Felicity 2026 - Password Reset OTP',
      `<div style="font-family:sans-serif;padding:20px;background:#0d0d0d;color:#fff;border-radius:12px">
        <h2 style="color:#00f3ff">Felicity 2026</h2>
        <p>Your password reset OTP is:</p>
        <h1 style="color:#ff2d75;letter-spacing:8px;text-align:center">${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color:#888">If you didn't request this, ignore this email.</p>
      </div>`
    );
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500); throw new Error('Email could not be sent. Check server email config.');
  }
});

// @desc    Verify OTP
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, resetOtp: otp, resetOtpExpiry: { $gt: Date.now() } });
  if (!user) { res.status(400); throw new Error('Invalid or expired OTP'); }
  res.status(200).json({ message: 'OTP verified', verified: true });
});

// @desc    Reset password (after OTP verified)
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email, resetOtp: otp, resetOtpExpiry: { $gt: Date.now() } });
  if (!user) { res.status(400); throw new Error('Invalid or expired OTP'); }

  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();
  res.status(200).json({ message: 'Password reset successful' });
});

// @desc    Follow / Unfollow an organizer
const toggleFollowOrganizer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const targetId = req.params.id;

  const target = await User.findById(targetId);
  if (!target || target.role !== 'organizer') { res.status(404); throw new Error('Organizer not found'); }

  const idx = user.followedOrganizers.indexOf(targetId);
  if (idx > -1) {
    user.followedOrganizers.splice(idx, 1);
  } else {
    user.followedOrganizers.push(targetId);
  }
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ followedOrganizers: user.followedOrganizers });
});

// @desc    Get all organizers (for clubs page)
const getAllOrganizers = asyncHandler(async (req, res) => {
  const organizers = await User.find({ role: 'organizer' }).select('organizerName category description contactEmail _id');
  res.status(200).json(organizers);
});

// @desc    Admin: send email to a participant
const adminSendEmail = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') { res.status(403); throw new Error('Admin only'); }
  const { to, subject, message } = req.body;
  if (!to || !subject || !message) { res.status(400); throw new Error('to, subject, message required'); }

  await sendEmail(to, subject,
    `<div style="font-family:sans-serif;padding:20px;background:#0d0d0d;color:#fff;border-radius:12px">
      <h2 style="color:#00f3ff">Felicity 2026 — Admin Notice</h2>
      <div style="margin:16px 0;color:#eee">${message}</div>
      <p style="color:#888;font-size:12px">This email was sent by the Felicity 2026 admin.</p>
    </div>`
  );
  res.status(200).json({ message: 'Email sent successfully' });
});

// @desc    Admin: search participants by name or email
const searchParticipants = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') { res.status(403); throw new Error('Admin only'); }
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const regex = new RegExp(q, 'i');
  const users = await User.find({
    role: 'participant',
    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { name: regex }],
  }).select('firstName lastName email _id').limit(10);
  res.json(users);
});

// ─── Organizer Password Reset (Admin Approval Flow) ───

// @desc    Organizer: request password reset (stores pending password)
const requestPasswordReset = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || user.role !== 'organizer') { res.status(403); throw new Error('Organizer only'); }
  const { newPassword, reason } = req.body;
  if (!newPassword || newPassword.length < 6) { res.status(400); throw new Error('New password must be at least 6 characters'); }
  if (!reason || reason.trim().length === 0) { res.status(400); throw new Error('Please provide a reason for the password change'); }

  const salt = await bcrypt.genSalt(10);
  user.pendingNewPassword = await bcrypt.hash(newPassword, salt);
  user.pendingPasswordReset = true;
  user.passwordResetRequestedAt = new Date();
  user.passwordResetReason = reason.trim();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ message: 'Password reset request submitted. Awaiting admin approval.' });
});

// @desc    Admin: get all pending organizer password resets
const getPendingResets = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') { res.status(403); throw new Error('Admin only'); }
  const pending = await User.find({ role: 'organizer', pendingPasswordReset: true })
    .select('organizerName email passwordResetRequestedAt passwordResetReason _id');
  res.json(pending);
});

// @desc    Admin: approve organizer password reset
const approvePasswordReset = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') { res.status(403); throw new Error('Admin only'); }
  const user = await User.findById(req.params.id);
  if (!user || !user.pendingPasswordReset) { res.status(404); throw new Error('No pending reset for this user'); }

  // Set the pre-hashed password directly
  user.password = user.pendingNewPassword;
  user.pendingPasswordReset = false;
  user.pendingNewPassword = undefined;
  user.passwordResetRequestedAt = undefined;
  user.passwordResetReason = '';
  await user.save({ validateBeforeSave: false }); // skip pre-save hash since already hashed

  res.status(200).json({ message: `Password reset approved for ${user.organizerName || user.email}` });
});

// @desc    Admin: reject organizer password reset
const rejectPasswordReset = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') { res.status(403); throw new Error('Admin only'); }
  const user = await User.findById(req.params.id);
  if (!user || !user.pendingPasswordReset) { res.status(404); throw new Error('No pending reset for this user'); }

  user.pendingPasswordReset = false;
  user.pendingNewPassword = undefined;
  user.passwordResetRequestedAt = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ message: `Password reset rejected for ${user.organizerName || user.email}` });
});

// Helper
function buildUserResponse(user) {
  return {
    _id: user._id, name: user.name, email: user.email, role: user.role,
    firstName: user.firstName, lastName: user.lastName,
    participantType: user.participantType, collegeName: user.collegeName,
    contactNumber: user.contactNumber, genres: user.genres,
    organizerName: user.organizerName, category: user.category,
    description: user.description, contactEmail: user.contactEmail,
    isIIIT: user.isIIIT, followedOrganizers: user.followedOrganizers,
    pendingPasswordReset: user.pendingPasswordReset,
  };
}

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

module.exports = {
  registerUser, loginUser, getMe, updateUserProfile, createOrganizer, deleteOrganizer,
  forgotPassword, verifyOtp, resetPassword,
  toggleFollowOrganizer, getAllOrganizers, adminSendEmail, searchParticipants,
  requestPasswordReset, getPendingResets, approvePasswordReset, rejectPasswordReset,
};
