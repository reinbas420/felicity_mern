const express = require('express');
const router = express.Router();
const {
    getMyEvents,
    getAllEvents,
    getAdminEvents,
    createEvent,
    registerForEvent,
    updateEvent,
    deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// Browse all events (with filters)
router.route('/').get(protect, getAllEvents).post(protect, createEvent);

// Organizer's own events
router.route('/my-events').get(protect, getMyEvents);

// Admin: all events split by upcoming/past
router.route('/admin/all').get(protect, getAdminEvents);

// Register for an event
router.route('/:id/register').post(protect, registerForEvent);

// Update/Delete event
router.route('/:id').put(protect, updateEvent).delete(protect, deleteEvent);

module.exports = router;
