const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // Section 8: Event Attributes
    title: {
        type: String,
        required: [true, 'Please add an event name'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    eventType: {
        type: String,
        enum: ['normal', 'merchandise'],
        default: 'normal',
    },
    eligibility: {
        type: String,
        enum: ['all', 'iiit_only'],
        default: 'all',
    },
    registrationDeadline: {
        type: Date,
    },
    startDate: {
        type: Date,
        required: [true, 'Please add a start date'],
    },
    endDate: {
        type: Date,
    },
    venue: {
        type: String,
        required: [true, 'Please add a venue'],
    },
    capacity: {
        type: Number,
        default: 100,
    },
    registrationFee: {
        type: Number,
        default: 0,
    },
    genre: {
        type: String,
        enum: ['tech', 'cultural', 'sports', 'academic', 'social', 'other'],
        default: 'other',
    },
    tags: {
        type: [String],
        default: [],
    },
    registrations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Legacy compat
    date: { type: Date },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
