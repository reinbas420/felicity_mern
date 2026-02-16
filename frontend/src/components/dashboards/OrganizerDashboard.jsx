import React, { useState, useEffect, useContext } from 'react';
import { NeonCard, NeonButton, NeonInput } from '../ui/NeonComponents';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';

const GENRE_OPTIONS = ['tech', 'cultural', 'sports', 'academic', 'social', 'other'];

const OrganizerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '', description: '', startDate: '', endDate: '',
        venue: '', genre: 'other', capacity: 100,
        eventType: 'normal', eligibility: 'all',
        registrationDeadline: '', registrationFee: 0, tags: '',
    });

    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/events/my-events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(res.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...newEvent,
                tags: newEvent.tags ? newEvent.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            };
            await axios.post('http://localhost:5000/api/events', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Event created successfully!');
            setShowCreateForm(false);
            setNewEvent({ title: '', description: '', startDate: '', endDate: '', venue: '', genre: 'other', capacity: 100, eventType: 'normal', eligibility: 'all', registrationDeadline: '', registrationFee: 0, tags: '' });
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating event');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting');
        }
    };

    const displayName = user?.organizerName || user?.name || 'Organizer';

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Welcome, <span className="neon-text">{displayName}</span></h2>

            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                <NeonCard title="Create Event">
                    <NeonButton onClick={() => setShowCreateForm(!showCreateForm)}>
                        {showCreateForm ? 'Cancel' : '+ New Event'}
                    </NeonButton>

                    {showCreateForm && (
                        <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem' }}>
                            <NeonInput placeholder="Event Title *" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
                            <NeonInput placeholder="Description *" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} required />

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Start Date *</label>
                                    <NeonInput type="date" value={newEvent.startDate} onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })} required style={{ colorScheme: 'dark' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>End Date</label>
                                    <NeonInput type="date" value={newEvent.endDate} onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} style={{ colorScheme: 'dark' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Registration Deadline</label>
                                <NeonInput type="date" value={newEvent.registrationDeadline} onChange={e => setNewEvent({ ...newEvent, registrationDeadline: e.target.value })} style={{ colorScheme: 'dark' }} />
                            </div>

                            <NeonInput placeholder="Venue *" value={newEvent.venue} onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })} required />

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Capacity</label>
                                    <NeonInput type="number" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) || 100 })} min="1" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Fee (₹)</label>
                                    <NeonInput type="number" value={newEvent.registrationFee} onChange={e => setNewEvent({ ...newEvent, registrationFee: parseInt(e.target.value) || 0 })} min="0" />
                                </div>
                            </div>

                            {/* Event Type */}
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Event Type:</label>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
                                    {[{ val: 'normal', label: 'Normal' }, { val: 'merchandise', label: 'Merchandise' }].map(opt => (
                                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: newEvent.eventType === opt.val ? 'var(--neon-cyan)' : 'var(--text-dim)' }}>
                                            <input type="radio" name="etype" value={opt.val} checked={newEvent.eventType === opt.val} onChange={e => setNewEvent({ ...newEvent, eventType: e.target.value })} />
                                            <span>{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Eligibility */}
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Eligibility:</label>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
                                    {[{ val: 'all', label: 'All' }, { val: 'iiit_only', label: 'IIIT Only' }].map(opt => (
                                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: newEvent.eligibility === opt.val ? 'var(--neon-cyan)' : 'var(--text-dim)' }}>
                                            <input type="radio" name="eligibility" value={opt.val} checked={newEvent.eligibility === opt.val} onChange={e => setNewEvent({ ...newEvent, eligibility: e.target.value })} />
                                            <span>{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Genre */}
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Genre:</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.3rem' }}>
                                    {GENRE_OPTIONS.map(g => (
                                        <button type="button" key={g} onClick={() => setNewEvent({ ...newEvent, genre: g })} style={{
                                            padding: '0.3rem 0.7rem', borderRadius: '16px',
                                            border: `1px solid ${newEvent.genre === g ? 'var(--neon-cyan)' : 'var(--border-color)'}`,
                                            background: newEvent.genre === g ? 'var(--neon-cyan)' : 'transparent',
                                            color: newEvent.genre === g ? '#000' : 'var(--text-color)',
                                            cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.8rem',
                                            fontWeight: newEvent.genre === g ? '700' : '400', transition: 'all 0.2s',
                                        }}>{g}</button>
                                    ))}
                                </div>
                            </div>

                            <NeonInput placeholder="Tags (comma separated)" value={newEvent.tags} onChange={e => setNewEvent({ ...newEvent, tags: e.target.value })} />
                            <NeonButton type="submit">Publish Event</NeonButton>
                        </form>
                    )}
                </NeonCard>

                <NeonCard title={`My Events (${events.length})`} variant="pure-black">
                    {events.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)' }}>No events yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {events.map(event => (
                                <div key={event._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--neon-cyan)' }}>{event.title}</h4>
                                        <button onClick={() => handleDelete(event._id)} style={{ background: 'transparent', border: 'none', color: 'var(--neon-magenta)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✕</button>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', margin: '0 0 0.3rem 0', color: 'var(--text-dim)' }}>{event.description}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                        <span>📅 {new Date(event.startDate || event.date).toLocaleDateString()}</span>
                                        <span>📍 {event.venue}</span>
                                        <span style={{ textTransform: 'capitalize' }}>🎭 {event.genre}</span>
                                        <span>📝 {event.eventType}</span>
                                        <span>👥 {event.registrations?.length || 0}/{event.capacity}</span>
                                        {event.registrationFee > 0 && <span>₹{event.registrationFee}</span>}
                                    </div>
                                    {event.tags?.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                                            {event.tags.map((t, i) => (
                                                <span key={i} style={{ padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', background: 'rgba(0,243,255,0.1)', color: 'var(--neon-cyan)', border: '1px solid rgba(0,243,255,0.2)' }}>{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </NeonCard>

                <NeonCard title="Analytics">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Events</span><span className="neon-text" style={{ fontSize: '1.5rem' }}>{events.length}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Registrations</span><span style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem' }}>{events.reduce((s, e) => s + (e.registrations?.length || 0), 0)}</span></div>
                    </div>
                </NeonCard>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
