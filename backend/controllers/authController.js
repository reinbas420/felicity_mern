const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Register a new user (participant or organizer)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please include email and password');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

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
  } else {
    userData.organizerName = req.body.organizerName || '';
    userData.category = req.body.category || '';
    userData.description = req.body.description || '';
    userData.contactEmail = req.body.contactEmail || email;
    userData.name = userData.organizerName;
  }

  const user = await User.create(userData);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      participantType: user.participantType,
      collegeName: user.collegeName,
      contactNumber: user.contactNumber,
      genres: user.genres,
      organizerName: user.organizerName,
      category: user.category,
      description: user.description,
      contactEmail: user.contactEmail,
      isIIIT: user.isIIIT,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Create Organizer (Admin only)
// @route   POST /api/auth/create-organizer
// @access  Private/Admin
const createOrganizer = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please include all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name, email, password, role: 'organizer', organizerName: name,
  });

  if (user) {
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      participantType: user.participantType,
      collegeName: user.collegeName,
      contactNumber: user.contactNumber,
      genres: user.genres,
      organizerName: user.organizerName,
      category: user.category,
      description: user.description,
      contactEmail: user.contactEmail,
      isIIIT: user.isIIIT,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    participantType: req.user.participantType,
    collegeName: req.user.collegeName,
    contactNumber: req.user.contactNumber,
    genres: req.user.genres,
    organizerName: req.user.organizerName,
    category: req.user.category,
    description: req.user.description,
    contactEmail: req.user.contactEmail,
    isIIIT: req.user.isIIIT,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update common
  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) { res.status(400); throw new Error('Email already in use'); }
    user.email = req.body.email;
  }
  if (req.body.password) user.password = req.body.password;

  // Update participant fields
  if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
  if (req.body.lastName !== undefined) user.lastName = req.body.lastName;
  if (req.body.participantType !== undefined) user.participantType = req.body.participantType;
  if (req.body.collegeName !== undefined) user.collegeName = req.body.collegeName;
  if (req.body.contactNumber !== undefined) user.contactNumber = req.body.contactNumber;
  if (req.body.genres) user.genres = req.body.genres;

  // Update organizer fields
  if (req.body.organizerName !== undefined) user.organizerName = req.body.organizerName;
  if (req.body.category !== undefined) user.category = req.body.category;
  if (req.body.description !== undefined) user.description = req.body.description;
  if (req.body.contactEmail !== undefined) user.contactEmail = req.body.contactEmail;

  // Sync legacy fields
  if (user.role === 'participant') {
    user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    user.isIIIT = user.participantType === 'iiit';
  } else if (user.role === 'organizer') {
    user.name = user.organizerName || user.name;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    participantType: updatedUser.participantType,
    collegeName: updatedUser.collegeName,
    contactNumber: updatedUser.contactNumber,
    genres: updatedUser.genres,
    organizerName: updatedUser.organizerName,
    category: updatedUser.category,
    description: updatedUser.description,
    contactEmail: updatedUser.contactEmail,
    isIIIT: updatedUser.isIIIT,
    token: generateToken(updatedUser._id),
  });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { registerUser, loginUser, getMe, updateUserProfile, createOrganizer };
