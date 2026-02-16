const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Common fields
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['participant', 'organizer', 'admin'],
    default: 'participant',
  },

  // Participant fields (Section 6.1)
  firstName: { type: String },
  lastName: { type: String },
  participantType: {
    type: String,
    enum: ['iiit', 'external'],
    default: 'external',
  },
  collegeName: { type: String },
  contactNumber: { type: String },
  genres: {
    type: [String],
    default: [],
  },

  // Organizer fields (Section 6.2)
  organizerName: { type: String },
  category: { type: String },
  description: { type: String },
  contactEmail: { type: String },

  // Legacy compat
  name: { type: String },
  isIIIT: { type: Boolean, default: false },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
