const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// @desc    Get organizer's own events
// @route   GET /api/events/my-events
// @access  Private (Organizer)
const getMyEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ organizer: req.user._id }).populate('organizer', 'name email organizerName');
    res.status(200).json(events);
});

// @desc    Get ALL events with filters (browse)
// @route   GET /api/events
// @access  Private
const getAllEvents = asyncHandler(async (req, res) => {
    const { genre, search, timeFilter } = req.query;
    let filter = {};

    if (genre && genre !== 'all') {
        filter.genre = genre;
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { venue: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
        ];
    }

    const now = new Date();
    if (timeFilter === 'upcoming') {
        filter.startDate = { $gte: now };
    } else if (timeFilter === 'past') {
        filter.startDate = { $lt: now };
    }

    const events = await Event.find(filter)
        .populate('organizer', 'name email organizerName')
        .sort({ startDate: 1 });

    res.status(200).json(events);
});

// @desc    Admin: all events split by upcoming/past
// @route   GET /api/events/admin/all
// @access  Private (Admin)
const getAdminEvents = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Admin access only');
    }

    const now = new Date();
    const upcoming = await Event.find({ startDate: { $gte: now } })
        .populate('organizer', 'name email organizerName')
        .populate('registrations', 'name email firstName lastName')
        .sort({ startDate: 1 });

    const past = await Event.find({ startDate: { $lt: now } })
        .populate('organizer', 'name email organizerName')
        .populate('registrations', 'name email firstName lastName')
        .sort({ startDate: -1 });

    res.status(200).json({ upcoming, past });
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer)
const createEvent = asyncHandler(async (req, res) => {
    if (req.user.role !== 'organizer') {
        res.status(403);
        throw new Error('Only organizers can create events');
    }

    const { title, description, venue, genre, capacity,
        eventType, eligibility, registrationDeadline,
        startDate, endDate, registrationFee, tags } = req.body;

    if (!title || !description || !startDate || !venue) {
        res.status(400);
        throw new Error('Please add title, description, start date, and venue');
    }

    const event = await Event.create({
        title, description, venue,
        genre: genre || 'other',
        capacity: capacity || 100,
        eventType: eventType || 'normal',
        eligibility: eligibility || 'all',
        registrationDeadline: registrationDeadline || null,
        startDate,
        endDate: endDate || null,
        date: startDate, // legacy compat
        registrationFee: registrationFee || 0,
        tags: tags || [],
        organizer: req.user._id,
    });

    res.status(201).json(event);
});

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.registrations.includes(req.user._id)) { res.status(400); throw new Error('Already registered'); }
    if (event.registrations.length >= event.capacity) { res.status(400); throw new Error('Event is full'); }

    event.registrations.push(req.user._id);
    await event.save();
    res.status(200).json({ message: 'Registered successfully', event });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer - owner)
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.organizer.toString() !== req.user._id.toString()) { res.status(401); throw new Error('Not authorized'); }
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer - owner)
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    if (event.organizer.toString() !== req.user._id.toString()) { res.status(401); throw new Error('Not authorized'); }
    await event.deleteOne();
    res.status(200).json({ id: req.params.id });
});

module.exports = { getMyEvents, getAllEvents, getAdminEvents, createEvent, registerForEvent, updateEvent, deleteEvent };
