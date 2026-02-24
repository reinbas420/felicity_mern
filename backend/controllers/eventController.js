const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// @desc    Get organizer's own events
const getMyEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ organizer: req.user._id }).populate('organizer', 'name organizerName email').sort({ startDate: -1 });
    res.status(200).json(events);
});

// @desc    Browse all events with filters
const getAllEvents = asyncHandler(async (req, res) => {
    const { genre, search, timeFilter, organizer } = req.query;
    let filter = { status: { $ne: 'draft' } }; // hide drafts from browse

    if (genre && genre !== 'all') filter.genre = genre;
    if (organizer) filter.organizer = organizer;

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { venue: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
        ];
    }

    const now = new Date();
    if (timeFilter === 'upcoming') filter.startDate = { $gte: now };
    else if (timeFilter === 'past') filter.startDate = { $lt: now };

    // IIIT-only filter: if requester is participant, check participantType
    if (req.user.role === 'participant' && req.user.participantType !== 'iiit') {
        filter.eligibility = { $ne: 'iiit_only' };
    }

    const events = await Event.find(filter).populate('organizer', 'name organizerName email category').sort({ startDate: 1 });
    res.status(200).json(events);
});

// @desc    Admin: all events split
const getAdminEvents = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') { res.status(403); throw new Error('Admin access only'); }
    const now = new Date();
    const upcoming = await Event.find({ startDate: { $gte: now } }).populate('organizer', 'name organizerName email').populate('registrations', 'name email firstName lastName').sort({ startDate: 1 });
    const past = await Event.find({ startDate: { $lt: now } }).populate('organizer', 'name organizerName email').populate('registrations', 'name email firstName lastName').sort({ startDate: -1 });
    res.status(200).json({ upcoming, past });
});

// @desc    Get single event detail (organizer view) with full registrations
const getEventDetail = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('organizer', 'name organizerName email')
        .populate('registrations', 'name email firstName lastName contactNumber collegeName participantType createdAt')
        .populate('attendance', 'name email firstName lastName');
    if (!event) { res.status(404); throw new Error('Event not found'); }
    res.status(200).json(event);
});

// @desc    Get event registrations with form responses (organizer)
const getEventRegistrations = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401); throw new Error('Not authorized');
    }
    const registrations = await Registration.find({ event: req.params.id })
        .populate('user', 'name email firstName lastName contactNumber collegeName participantType')
        .sort({ registeredAt: -1 });
    res.status(200).json(registrations);
});

// @desc    Mark attendance for a participant
const markAttendance = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.organizer.toString() !== req.user._id.toString()) { res.status(401); throw new Error('Not authorized'); }
    const { userId } = req.body;
    if (!event.registrations.map(r => r.toString()).includes(userId)) { res.status(400); throw new Error('User not registered'); }
    if (event.attendance.map(a => a.toString()).includes(userId)) { res.status(400); throw new Error('Already marked'); }
    event.attendance.push(userId);
    await event.save();
    res.status(200).json({ message: 'Attendance marked', attendance: event.attendance });
});

// @desc    Create new event
const createEvent = asyncHandler(async (req, res) => {
    if (req.user.role !== 'organizer') { res.status(403); throw new Error('Only organizers can create events'); }
    const { title, description, venue, genre, capacity, eventType, eligibility, registrationDeadline, startDate, endDate, registrationFee, tags, status, merchandiseItems } = req.body;
    if (!title || !description || !startDate || !venue) { res.status(400); throw new Error('Please add title, description, start date, and venue'); }

    // Process merchandise items: convert comma-separated strings to arrays
    let processedMerchandiseItems = [];
    if (eventType === 'merchandise' && Array.isArray(merchandiseItems)) {
        processedMerchandiseItems = merchandiseItems.map(item => ({
            itemName: item.itemName || '',
            sizes: typeof item.sizes === 'string' ? item.sizes.split(',').map(s => s.trim()).filter(Boolean) : (item.sizes || []),
            colors: typeof item.colors === 'string' ? item.colors.split(',').map(s => s.trim()).filter(Boolean) : (item.colors || []),
            variants: typeof item.variants === 'string' ? item.variants.split(',').map(s => s.trim()).filter(Boolean) : (item.variants || []),
            stockQuantity: item.stockQuantity || 0,
            purchaseLimitPerUser: item.purchaseLimitPerUser || 1,
            price: item.price || 0,
        }));
    }

    const event = await Event.create({
        title, description, venue,
        genre: genre || 'other', capacity: capacity || 100,
        eventType: eventType || 'normal', eligibility: eligibility || 'all',
        registrationDeadline: registrationDeadline || null,
        startDate, endDate: endDate || null, date: startDate,
        registrationFee: registrationFee || 0, tags: tags || [],
        status: status || 'published',
        organizer: req.user._id,
        merchandiseItems: processedMerchandiseItems,
        customFormFields: req.body.customFormFields || [],
    });
    res.status(201).json(event);
});

// @desc    Register for an event (with optional custom form responses)
const registerForEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.registrations.includes(req.user._id)) { res.status(400); throw new Error('Already registered'); }
    if (event.registrations.length >= event.capacity) { res.status(400); throw new Error('Event is full'); }

    // IIIT-only eligibility check
    if (event.eligibility === 'iiit_only') {
        const participant = await User.findById(req.user._id);
        if (participant.participantType !== 'iiit') {
            res.status(403); throw new Error('This event is only open to IIIT students');
        }
    }

    // Validate required custom form fields
    const { formResponses } = req.body;
    const hasCustomForm = event.customFormFields && event.customFormFields.length > 0;

    if (hasCustomForm) {
        const requiredFields = event.customFormFields.filter(f => f.required);
        for (const field of requiredFields) {
            const response = formResponses?.find(r => r.fieldId === field.fieldId);
            if (!response || response.value === '' || response.value === null || response.value === undefined ||
                (Array.isArray(response.value) && response.value.length === 0)) {
                res.status(400); throw new Error(`Field "${field.label}" is required`);
            }
        }
    }

    // Check if already has a pending/rejected registration
    const existingReg = await Registration.findOne({ event: event._id, user: req.user._id });
    if (existingReg) { res.status(400); throw new Error('You already have a registration for this event'); }

    if (hasCustomForm && formResponses && formResponses.length > 0) {
        // Custom form events: registration is PENDING until organizer approves
        await Registration.create({
            event: event._id,
            user: req.user._id,
            formResponses,
            status: 'pending',
        });

        // Lock the form on first registration
        if (!event.formLocked) {
            event.formLocked = true;
            await event.save();
        }

        // Send confirmation email to participant
        try {
            const participant = await User.findById(req.user._id);
            await sendEmail(
                participant.email,
                `Registration Submitted — ${event.title}`,
                `<h2>Hi ${participant.firstName || participant.name || ''}!</h2>
                <p>Your registration for <strong>${event.title}</strong> has been submitted and is <strong>pending organizer approval</strong>.</p>
                <p><strong>Event Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p>You will be notified once your registration is approved.</p>
                <br><p>— Felicity 2026 Team</p>`
            );
        } catch (emailErr) {
            console.error('Failed to send registration email:', emailErr.message);
        }

        res.status(200).json({ message: 'Registration submitted! Awaiting organizer approval.', pending: true });
    } else {
        // No custom form: auto-approve
        if (formResponses && formResponses.length > 0) {
            await Registration.create({
                event: event._id,
                user: req.user._id,
                formResponses,
                status: 'approved',
            });
        }
        event.registrations.push(req.user._id);
        await event.save();

        // Send confirmation email to participant
        try {
            const participant = await User.findById(req.user._id);
            await sendEmail(
                participant.email,
                `Registration Confirmed — ${event.title}`,
                `<h2>Hi ${participant.firstName || participant.name || ''}!</h2>
                <p>You have been successfully registered for <strong>${event.title}</strong>!</p>
                <p><strong>Event Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                ${event.registrationFee > 0 ? `<p><strong>Fee:</strong> ₹${event.registrationFee}</p>` : ''}
                <p>See you there! 🎉</p>
                <br><p>— Felicity 2026 Team</p>`
            );
        } catch (emailErr) {
            console.error('Failed to send registration email:', emailErr.message);
        }

        res.status(200).json({ message: 'Registered successfully', event });
    }
});

// @desc    Organizer: approve a pending registration
const approveRegistration = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.organizer.toString() !== req.user._id.toString()) { res.status(401); throw new Error('Not authorized'); }

    const registration = await Registration.findById(req.params.regId);
    if (!registration || registration.event.toString() !== event._id.toString()) {
        res.status(404); throw new Error('Registration not found');
    }
    if (registration.status !== 'pending') { res.status(400); throw new Error('Registration is not pending'); }

    // Check capacity
    if (event.registrations.length >= event.capacity) { res.status(400); throw new Error('Event is full'); }

    registration.status = 'approved';
    await registration.save();

    // Add user to event registrations
    if (!event.registrations.includes(registration.user)) {
        event.registrations.push(registration.user);
        await event.save();
    }

    res.status(200).json({ message: 'Registration approved' });
});

// @desc    Organizer: reject a pending registration
const rejectRegistration = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.organizer.toString() !== req.user._id.toString()) { res.status(401); throw new Error('Not authorized'); }

    const registration = await Registration.findById(req.params.regId);
    if (!registration || registration.event.toString() !== event._id.toString()) {
        res.status(404); throw new Error('Registration not found');
    }
    if (registration.status !== 'pending') { res.status(400); throw new Error('Registration is not pending'); }

    registration.status = 'rejected';
    await registration.save();

    res.status(200).json({ message: 'Registration rejected' });
});

// @desc    Organizer: update custom form fields for an event
const updateEventForm = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.organizer.toString() !== req.user._id.toString()) {
        res.status(401); throw new Error('Not authorized');
    }
    if (event.formLocked) {
        res.status(400); throw new Error('Form is locked — registrations have already started. Cannot modify form fields.');
    }

    const { customFormFields } = req.body;
    if (!Array.isArray(customFormFields)) {
        res.status(400); throw new Error('customFormFields must be an array');
    }

    event.customFormFields = customFormFields;
    await event.save();
    res.status(200).json({ message: 'Form updated', customFormFields: event.customFormFields, formLocked: event.formLocked });
});

// @desc    Trending events
const getTrendingEvents = asyncHandler(async (req, res) => {
    const now = new Date();
    let filter = { startDate: { $gte: now }, status: { $ne: 'draft' } };
    // IIIT-only filter
    if (req.user.role === 'participant' && req.user.participantType !== 'iiit') {
        filter.eligibility = { $ne: 'iiit_only' };
    }
    const events = await Event.find(filter)
        .populate('organizer', 'name organizerName email').sort({ startDate: 1 });
    const sorted = events.sort((a, b) => (b.registrations?.length || 0) - (a.registrations?.length || 0));
    res.status(200).json(sorted.slice(0, 5));
});

// @desc    My registered upcoming
const getMyRegisteredEvents = asyncHandler(async (req, res) => {
    const now = new Date();
    const events = await Event.find({ registrations: req.user._id, startDate: { $gte: now } })
        .populate('organizer', 'name organizerName email').sort({ startDate: 1 });
    res.status(200).json(events);
});

// @desc    Events from followed organizers
const getFollowedEvents = asyncHandler(async (req, res) => {
    const user = await require('../models/User').findById(req.user._id);
    if (!user.followedOrganizers || user.followedOrganizers.length === 0) return res.status(200).json([]);
    const now = new Date();
    const events = await Event.find({ organizer: { $in: user.followedOrganizers }, startDate: { $gte: now }, status: { $ne: 'draft' } })
        .populate('organizer', 'name organizerName email').sort({ startDate: 1 });
    res.status(200).json(events);
});

// @desc    Participation history
const getParticipationHistory = asyncHandler(async (req, res) => {
    const now = new Date();
    const events = await Event.find({ registrations: req.user._id, startDate: { $lt: now } })
        .populate('organizer', 'name organizerName email').sort({ startDate: -1 });
    res.status(200).json(events);
});

// Update/Delete
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.organizer.toString() !== req.user._id.toString()) { res.status(401); throw new Error('Not authorized'); }
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
});

const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    // Allow organizer who owns it OR admin
    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) { res.status(401); throw new Error('Not authorized'); }
    // Also delete associated registrations
    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();
    res.status(200).json({ id: req.params.id });
});

// @desc    Publish a draft event
const publishEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.organizer.toString() !== req.user._id.toString()) { res.status(401); throw new Error('Not authorized'); }
    if (event.status !== 'draft') { res.status(400); throw new Error('Event is already published'); }
    event.status = 'published';
    await event.save();
    res.status(200).json({ message: 'Event published successfully', event });
});

// @desc    Organizer: send email to all registered participants of an event
const sendEmailToParticipants = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('registrations', 'email firstName lastName name');
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401); throw new Error('Not authorized');
    }

    const { subject, message } = req.body;
    if (!subject || !message) { res.status(400); throw new Error('Subject and message are required'); }

    const participants = event.registrations || [];
    if (participants.length === 0) { res.status(400); throw new Error('No registered participants to email'); }

    let sent = 0;
    let failed = 0;
    for (const participant of participants) {
        try {
            await sendEmail(participant.email, subject, message);
            sent++;
        } catch (err) {
            console.error(`Failed to send email to ${participant.email}:`, err.message);
            failed++;
        }
    }

    res.status(200).json({ message: `Emails sent: ${sent} successful, ${failed} failed`, sent, failed });
});

module.exports = {
    getMyEvents, getAllEvents, getAdminEvents, getEventDetail, getEventRegistrations, markAttendance,
    createEvent, registerForEvent, updateEventForm,
    getTrendingEvents, getMyRegisteredEvents, getFollowedEvents, getParticipationHistory,
    updateEvent, deleteEvent, publishEvent, approveRegistration, rejectRegistration,
    sendEmailToParticipants,
};
