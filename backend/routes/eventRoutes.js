const express = require('express');
const router = express.Router();
const {
    getMyEvents, getAllEvents, getAdminEvents, getEventDetail, getEventRegistrations, markAttendance,
    createEvent, registerForEvent, updateEventForm,
    getTrendingEvents, getMyRegisteredEvents, getFollowedEvents, getParticipationHistory,
    updateEvent, deleteEvent, publishEvent, approveRegistration, rejectRegistration,
    sendEmailToParticipants,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAllEvents).post(protect, createEvent);
router.route('/my-events').get(protect, getMyEvents);
router.route('/admin/all').get(protect, getAdminEvents);
router.route('/trending').get(protect, getTrendingEvents);
router.route('/my-registered').get(protect, getMyRegisteredEvents);
router.route('/followed').get(protect, getFollowedEvents);
router.route('/history').get(protect, getParticipationHistory);
router.route('/:id/register').post(protect, registerForEvent);
router.route('/:id/attendance').post(protect, markAttendance);
router.route('/:id/form').put(protect, updateEventForm);
router.route('/:id/registrations').get(protect, getEventRegistrations);
router.route('/:id/publish').put(protect, publishEvent);
router.route('/:eventId/registrations/:regId/approve').put(protect, approveRegistration);
router.route('/:eventId/registrations/:regId/reject').put(protect, rejectRegistration);
router.route('/:id/send-email').post(protect, sendEmailToParticipants);
router.route('/:id').get(protect, getEventDetail).put(protect, updateEvent).delete(protect, deleteEvent);

module.exports = router;
