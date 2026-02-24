import React, { useState, useEffect, useContext } from 'react';
import { NeonCard, NeonButton, NeonInput } from '../ui/NeonComponents';
import AuthContext from '../../context/AuthContext';
import FormBuilder from '../FormBuilder';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../api_config';

const GENRE_OPTIONS = ['tech', 'cultural', 'sports', 'academic', 'social', 'other'];
const STATUS_OPTIONS = ['draft', 'published'];

const OrganizerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [carouselIdx, setCarouselIdx] = useState(0);
    const [newEvent, setNewEvent] = useState({
        title: '', description: '', startDate: '', endDate: '',
        venue: '', genre: 'other', capacity: 100,
        eventType: 'normal', eligibility: 'all',
        registrationDeadline: '', registrationFee: 0, tags: '', status: 'published',
        merchandiseItems: [],
    });
    const [customFormFields, setCustomFormFields] = useState([]);
    const [showFormBuilder, setShowFormBuilder] = useState(false);
    const [pendingRegs, setPendingRegs] = useState([]);

    useEffect(() => { fetchEvents(); }, []);
    useEffect(() => { if (events.length > 0) fetchPendingRegistrations(); }, [events]);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/events/my-events`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(res.data);
        } catch (error) { console.error(error); }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...newEvent,
                tags: newEvent.tags ? newEvent.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                merchandiseItems: newEvent.eventType === 'merchandise' ? newEvent.merchandiseItems : [],
                customFormFields: customFormFields,
            };
            await axios.post(`${API_URL}/api/events`, payload, { headers: { Authorization: `Bearer ${token}` } });
            setShowModal(false);
            setNewEvent({ title: '', description: '', startDate: '', endDate: '', venue: '', genre: 'other', capacity: 100, eventType: 'normal', eligibility: 'all', registrationDeadline: '', registrationFee: 0, tags: '', status: 'published', merchandiseItems: [] });
            setCustomFormFields([]);
            setShowFormBuilder(false);
            fetchEvents();
        } catch (error) { alert(error.response?.data?.message || 'Error creating event'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchEvents();
        } catch (error) { alert(error.response?.data?.message || 'Error deleting'); }
    };

    const handlePublish = async (id) => {
        if (!window.confirm('Publish this event? It will become visible to all participants.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/events/${id}/publish`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchEvents();
        } catch (error) { alert(error.response?.data?.message || 'Error publishing'); }
    };

    const fetchPendingRegistrations = async () => {
        try {
            const token = localStorage.getItem('token');
            const allPending = [];
            for (const event of events) {
                if (event.customFormFields && event.customFormFields.length > 0) {
                    const res = await axios.get(`${API_URL}/api/events/${event._id}/registrations`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const pending = res.data.filter(r => r.status === 'pending');
                    if (pending.length > 0) {
                        allPending.push({ event, registrations: pending });
                    }
                }
            }
            setPendingRegs(allPending);
        } catch (err) { console.error(err); }
    };

    const handleApproveReg = async (eventId, regId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/events/${eventId}/registrations/${regId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchEvents();
        } catch (err) { alert(err.response?.data?.message || 'Error approving'); }
    };

    const handleRejectReg = async (eventId, regId) => {
        if (!window.confirm('Reject this registration?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/events/${eventId}/registrations/${regId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchEvents();
        } catch (err) { alert(err.response?.data?.message || 'Error rejecting'); }
    };

    const getStatus = (event) => {
        if (event.status === 'draft') return 'Draft';
        const now = new Date();
        const start = new Date(event.startDate);
        const end = event.endDate ? new Date(event.endDate) : start;
        if (now < start) return 'Published';
        if (now >= start && now <= end) return 'Ongoing';
        return 'Closed';
    };

    const getStatusColor = (s) => {
        const map = { 'Draft': '#888', 'Published': 'var(--neon-cyan)', 'Ongoing': '#f59e0b', 'Closed': 'var(--neon-magenta)' };
        return map[s] || 'var(--text-dim)';
    };

    const displayName = user?.organizerName || user?.name || 'Organizer';
    const now = new Date();
    const ongoing = events.filter(e => e.status !== 'draft' && new Date(e.startDate) <= now && (e.endDate ? new Date(e.endDate) >= now : new Date(e.startDate) >= now));
    const pastEvents = events.filter(e => {
        const end = e.endDate ? new Date(e.endDate) : new Date(e.startDate);
        return end < now;
    });

    // Analytics
    const totalRegs = events.reduce((s, e) => s + (e.registrations?.length || 0), 0);
    const totalRevenue = pastEvents.reduce((s, e) => s + ((e.registrations?.length || 0) * (e.registrationFee || 0)), 0);
    const totalAttendance = events.reduce((s, e) => s + (e.attendance?.length || 0), 0);

    // Carousel
    const carouselEvents = events;
    const visibleCards = 3;
    const maxIdx = Math.max(0, carouselEvents.length - visibleCards);

    return (
        <div style={{ padding: '2rem', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Welcome, <span className="neon-text">{displayName}</span></h2>
                <NeonButton onClick={() => setShowModal(true)}>+ Create Event</NeonButton>
            </div>

            {/* Events Carousel */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <h3 style={{ margin: 0 }}>My Events ({events.length})</h3>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={() => setCarouselIdx(Math.max(0, carouselIdx - 1))} disabled={carouselIdx === 0}
                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: carouselIdx > 0 ? 'pointer' : 'not-allowed', opacity: carouselIdx > 0 ? 1 : 0.3 }}>◀</button>
                        <button onClick={() => setCarouselIdx(Math.min(maxIdx, carouselIdx + 1))} disabled={carouselIdx >= maxIdx}
                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: carouselIdx < maxIdx ? 'pointer' : 'not-allowed', opacity: carouselIdx < maxIdx ? 1 : 0.3 }}>▶</button>
                    </div>
                </div>

                {events.length === 0 ? (
                    <p style={{ color: 'var(--text-dim)' }}>No events yet. Create your first!</p>
                ) : (
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{
                            display: 'flex', gap: '1rem',
                            transform: `translateX(-${carouselIdx * 310}px)`,
                            transition: 'transform 0.3s ease',
                        }}>
                            {carouselEvents.map(event => {
                                const st = getStatus(event);
                                return (
                                    <div key={event._id} style={{
                                        flex: '0 0 290px', padding: '1rem', border: '1px solid var(--border-color)',
                                        borderRadius: '14px', background: 'var(--bg-card)',
                                        display: 'flex', flexDirection: 'column', gap: '0.4rem',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h4 style={{ margin: 0, color: 'var(--neon-cyan)', fontSize: '0.95rem', flex: 1 }}>{event.title}</h4>
                                            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: '700', color: getStatusColor(st), border: `1px solid ${getStatusColor(st)}`, whiteSpace: 'nowrap' }}>{st}</span>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>🎭 {event.genre} · {event.eventType}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                            <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                                            <span>📍 {event.venue}</span>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                            👥 {event.registrations?.length || 0}/{event.capacity}
                                            {event.registrationFee > 0 && ` · ₹${event.registrationFee}`}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                                            {st === 'Draft' && (
                                                <button onClick={() => handlePublish(event._id)} style={{
                                                    background: 'var(--neon-cyan)', border: 'none', color: '#000',
                                                    padding: '0.25rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700',
                                                }}>🚀 Publish</button>
                                            )}
                                            <Link to={`/organizer/event/${event._id}`} style={{ textDecoration: 'none' }}>
                                                <NeonButton style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Manage</NeonButton>
                                            </Link>
                                            <button onClick={() => handleDelete(event._id)} style={{
                                                background: 'transparent', border: '1px solid var(--neon-magenta)', color: 'var(--neon-magenta)',
                                                padding: '0.2rem 0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem',
                                            }}>Delete</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                {/* Ongoing Events */}
                <NeonCard title={`Ongoing Events (${ongoing.length})`}>
                    {ongoing.length === 0 ? <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No ongoing events.</p> :
                        ongoing.map(e => (
                            <div key={e._id} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                <Link to={`/organizer/event/${e._id}`} style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontWeight: '600' }}>{e.title}</Link>
                                <span style={{ marginLeft: '0.5rem', color: 'var(--text-dim)', fontSize: '0.72rem' }}>👥 {e.registrations?.length || 0}</span>
                            </div>
                        ))
                    }
                </NeonCard>

                {/* Analytics */}
                <NeonCard title="Analytics Summary">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {[
                            { label: 'Total Events', val: events.length, color: 'var(--neon-cyan)' },
                            { label: 'Total Registrations', val: totalRegs, color: 'var(--neon-cyan)' },
                            { label: 'Revenue Earned', val: `₹${totalRevenue}`, color: '#f59e0b' },
                            { label: 'Total Attendance', val: totalAttendance, color: 'var(--neon-magenta)' },
                            { label: 'Completed Events', val: pastEvents.length, color: 'var(--neon-purple)' },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.88rem' }}>{s.label}</span>
                                <span style={{ color: s.color, fontSize: '1.2rem', fontWeight: '700' }}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </NeonCard>
            </div>

            {/* Pending Registration Approvals */}
            {pendingRegs.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                    <NeonCard title={`Pending Registration Approvals (${pendingRegs.reduce((s, e) => s + e.registrations.length, 0)})`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {pendingRegs.map(({ event, registrations }) => (
                                <div key={event._id}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>{event.title}</h4>
                                    {registrations.map(reg => (
                                        <div key={reg._id} style={{
                                            padding: '0.7rem', border: '1px solid var(--border-color)', borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.02)', marginBottom: '0.5rem',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                                                        {reg.user?.firstName ? `${reg.user.firstName} ${reg.user.lastName || ''}`.trim() : reg.user?.name || reg.user?.email || 'Unknown'}
                                                    </span>
                                                    <p style={{ margin: '0.1rem 0', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{reg.user?.email}</p>
                                                    <p style={{ margin: '0.1rem 0', fontSize: '0.68rem', color: 'var(--text-dim)' }}>Submitted: {new Date(reg.registeredAt).toLocaleString()}</p>
                                                    {/* Form responses */}
                                                    {reg.formResponses?.length > 0 && (
                                                        <div style={{ marginTop: '0.4rem', padding: '0.5rem', background: 'rgba(0,243,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                                            {reg.formResponses.map((resp, i) => {
                                                                const fieldDef = event.customFormFields?.find(f => f.fieldId === resp.fieldId);
                                                                return (
                                                                    <div key={i} style={{ marginBottom: '0.2rem', fontSize: '0.78rem' }}>
                                                                        <span style={{ color: 'var(--text-dim)' }}>{fieldDef?.label || resp.fieldId}: </span>
                                                                        <span style={{ fontWeight: '600' }}>{Array.isArray(resp.value) ? resp.value.join(', ') : resp.value}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.3rem', alignSelf: 'center' }}>
                                                    <button onClick={() => handleApproveReg(event._id, reg._id)} style={{
                                                        background: 'var(--neon-cyan)', color: '#000', border: 'none',
                                                        padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700',
                                                    }}>✓ Approve</button>
                                                    <button onClick={() => handleRejectReg(event._id, reg._id)} style={{
                                                        background: 'transparent', color: 'var(--neon-magenta)', border: '1px solid var(--neon-magenta)',
                                                        padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700',
                                                    }}>✕ Reject</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </NeonCard>
                </div>
            )}

            {/* Modal Overlay for Create Event */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1rem',
                }}>
                    <div style={{
                        background: 'var(--bg-color)', border: '1px solid var(--neon-cyan)',
                        borderRadius: '20px', padding: '2rem', maxWidth: '520px', width: '100%',
                        maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 0 40px rgba(0,243,255,0.2)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                            <h3 style={{ margin: 0, background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create New Event</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--neon-magenta)', fontSize: '1.3rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </div>

                        <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <NeonInput placeholder="Event Title *" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
                            <NeonInput placeholder="Description *" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} required />

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}><label style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Start Date *</label>
                                    <NeonInput type="date" value={newEvent.startDate} onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })} required /></div>
                                <div style={{ flex: 1 }}><label style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>End Date</label>
                                    <NeonInput type="date" value={newEvent.endDate} onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} /></div>
                            </div>

                            <div><label style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Registration Deadline</label>
                                <NeonInput type="date" value={newEvent.registrationDeadline} onChange={e => setNewEvent({ ...newEvent, registrationDeadline: e.target.value })} /></div>

                            <NeonInput placeholder="Venue *" value={newEvent.venue} onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })} required />

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}><label style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Capacity</label>
                                    <NeonInput type="number" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) || 100 })} min="1" /></div>
                                <div style={{ flex: 1 }}><label style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Fee (₹)</label>
                                    <NeonInput type="number" value={newEvent.registrationFee} onChange={e => setNewEvent({ ...newEvent, registrationFee: parseInt(e.target.value) || 0 })} min="0" /></div>
                            </div>

                            {/* Status */}
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Status:</label>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
                                    {STATUS_OPTIONS.map(opt => (
                                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: newEvent.status === opt ? 'var(--neon-cyan)' : 'var(--text-dim)', textTransform: 'capitalize' }}>
                                            <input type="checkbox" checked={newEvent.status === opt} onChange={() => setNewEvent({ ...newEvent, status: opt })} /><span>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Event Type */}
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Event Type:</label>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
                                    {[{ val: 'normal', label: 'Normal' }, { val: 'merchandise', label: 'Merchandise' }].map(opt => (
                                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: newEvent.eventType === opt.val ? 'var(--neon-cyan)' : 'var(--text-dim)' }}>
                                            <input type="checkbox" checked={newEvent.eventType === opt.val} onChange={() => setNewEvent({ ...newEvent, eventType: opt.val })} /><span>{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Eligibility */}
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Eligibility:</label>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
                                    {[{ val: 'all', label: 'All' }, { val: 'iiit_only', label: 'IIIT Only' }].map(opt => (
                                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: newEvent.eligibility === opt.val ? 'var(--neon-cyan)' : 'var(--text-dim)' }}>
                                            <input type="checkbox" checked={newEvent.eligibility === opt.val} onChange={() => setNewEvent({ ...newEvent, eligibility: opt.val })} /><span>{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Genre */}
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Genre:</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.3rem' }}>
                                    {GENRE_OPTIONS.map(g => (
                                        <button type="button" key={g} onClick={() => setNewEvent({ ...newEvent, genre: g })} style={{
                                            padding: '0.25rem 0.6rem', borderRadius: '16px',
                                            border: `1px solid ${newEvent.genre === g ? 'var(--neon-cyan)' : 'var(--border-color)'}`,
                                            background: newEvent.genre === g ? 'var(--neon-cyan)' : 'transparent',
                                            color: newEvent.genre === g ? '#000' : 'var(--text-color)',
                                            cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.78rem', fontWeight: newEvent.genre === g ? '700' : '400', transition: 'all 0.2s',
                                        }}>{g}</button>
                                    ))}
                                </div>
                            </div>

                            <NeonInput placeholder="Tags (comma separated)" value={newEvent.tags} onChange={e => setNewEvent({ ...newEvent, tags: e.target.value })} />

                            {/* Merchandise Items */}
                            {newEvent.eventType === 'merchandise' && (
                                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Merchandise Items</label>
                                        <button type="button" onClick={() => setNewEvent({
                                            ...newEvent,
                                            merchandiseItems: [...newEvent.merchandiseItems, { itemName: '', sizes: '', colors: '', variants: '', stockQuantity: 0, purchaseLimitPerUser: 1, price: 0 }]
                                        })} style={{
                                            padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '700',
                                            background: 'var(--neon-cyan)', color: '#000', border: 'none', cursor: 'pointer',
                                        }}>+ Add Item</button>
                                    </div>
                                    {newEvent.merchandiseItems.map((item, idx) => (
                                        <div key={idx} style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '10px', marginBottom: '0.5rem', background: 'rgba(0,243,255,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', fontWeight: '600' }}>Item {idx + 1}</span>
                                                <button type="button" onClick={() => {
                                                    const items = [...newEvent.merchandiseItems];
                                                    items.splice(idx, 1);
                                                    setNewEvent({ ...newEvent, merchandiseItems: items });
                                                }} style={{ background: 'none', border: 'none', color: 'var(--neon-magenta)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>×</button>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <NeonInput placeholder="Item Name" value={item.itemName} onChange={e => { const items = [...newEvent.merchandiseItems]; items[idx].itemName = e.target.value; setNewEvent({ ...newEvent, merchandiseItems: items }); }} />
                                                <NeonInput placeholder="Sizes (comma sep: S,M,L,XL)" value={item.sizes} onChange={e => { const items = [...newEvent.merchandiseItems]; items[idx].sizes = e.target.value; setNewEvent({ ...newEvent, merchandiseItems: items }); }} />
                                                <NeonInput placeholder="Colors (comma sep)" value={item.colors} onChange={e => { const items = [...newEvent.merchandiseItems]; items[idx].colors = e.target.value; setNewEvent({ ...newEvent, merchandiseItems: items }); }} />
                                                <NeonInput placeholder="Variants (comma sep)" value={item.variants} onChange={e => { const items = [...newEvent.merchandiseItems]; items[idx].variants = e.target.value; setNewEvent({ ...newEvent, merchandiseItems: items }); }} />
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <div style={{ flex: 1 }}><label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Stock</label>
                                                        <NeonInput type="number" value={item.stockQuantity} onChange={e => { const items = [...newEvent.merchandiseItems]; items[idx].stockQuantity = parseInt(e.target.value) || 0; setNewEvent({ ...newEvent, merchandiseItems: items }); }} min="0" /></div>
                                                    <div style={{ flex: 1 }}><label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Limit/User</label>
                                                        <NeonInput type="number" value={item.purchaseLimitPerUser} onChange={e => { const items = [...newEvent.merchandiseItems]; items[idx].purchaseLimitPerUser = parseInt(e.target.value) || 1; setNewEvent({ ...newEvent, merchandiseItems: items }); }} min="1" /></div>
                                                    <div style={{ flex: 1 }}><label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Price (₹)</label>
                                                        <NeonInput type="number" value={item.price} onChange={e => { const items = [...newEvent.merchandiseItems]; items[idx].price = parseInt(e.target.value) || 0; setNewEvent({ ...newEvent, merchandiseItems: items }); }} min="0" /></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {newEvent.merchandiseItems.length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>No items added yet.</p>}
                                </div>
                            )}

                            {/* Custom Registration Form Builder */}
                            <div style={{ marginTop: '0.5rem' }}>
                                <NeonButton type="button" onClick={() => setShowFormBuilder(!showFormBuilder)} style={{ fontSize: '0.85rem', marginBottom: showFormBuilder ? '0.8rem' : 0 }}>
                                    {showFormBuilder ? '▾ Hide Custom Form' : '▸ Add Custom Registration Form'}
                                </NeonButton>
                                {showFormBuilder && (
                                    <FormBuilder
                                        fields={customFormFields}
                                        onSave={(fields) => { setCustomFormFields(fields); alert('Form fields saved! They will be included when you publish the event.'); }}
                                    />
                                )}
                                {customFormFields.length > 0 && !showFormBuilder && (
                                    <p style={{ fontSize: '0.78rem', color: 'var(--neon-cyan)', marginTop: '0.3rem' }}>✓ {customFormFields.length} custom field(s) attached</p>
                                )}
                            </div>

                            <NeonButton type="submit" style={{ marginTop: '0.5rem' }}>Publish Event</NeonButton>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerDashboard;
