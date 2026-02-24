const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    formResponses: [{
        fieldId: { type: String },
        value: { type: mongoose.Schema.Types.Mixed },
    }],
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
    registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Compound index: one registration per user per event
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
