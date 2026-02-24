const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Please add an event name'] },
    description: { type: String, required: [true, 'Please add a description'] },
    eventType: { type: String, enum: ['normal', 'merchandise'], default: 'normal' },
    status: { type: String, enum: ['draft', 'published', 'ongoing', 'closed'], default: 'published' },
    eligibility: { type: String, enum: ['all', 'iiit_only'], default: 'all' },
    registrationDeadline: { type: Date },
    startDate: { type: Date, required: [true, 'Please add a start date'] },
    endDate: { type: Date },
    venue: { type: String, required: [true, 'Please add a venue'] },
    capacity: { type: Number, default: 100 },
    registrationFee: { type: Number, default: 0 },
    genre: { type: String, enum: ['tech', 'cultural', 'sports', 'academic', 'social', 'other'], default: 'other' },
    tags: { type: [String], default: [] },
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    merchandiseItems: [{
        itemName: { type: String },
        sizes: [{ type: String }],
        colors: [{ type: String }],
        variants: [{ type: String }],
        stockQuantity: { type: Number, default: 0 },
        purchaseLimitPerUser: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
    }],
    customFormFields: [{
        fieldId: { type: String },
        label: { type: String },
        fieldType: { type: String, enum: ['text', 'textarea', 'number', 'dropdown', 'checkbox', 'file', 'date', 'email', 'phone'], default: 'text' },
        required: { type: Boolean, default: false },
        options: [{ type: String }],
        placeholder: { type: String, default: '' },
        order: { type: Number, default: 0 },
    }],
    formLocked: { type: Boolean, default: false },
    date: { type: Date }, // legacy
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
