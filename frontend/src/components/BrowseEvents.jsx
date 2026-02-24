import React, { useState, useEffect, useContext } from 'react';
import { NeonCard, NeonButton, NeonInput } from './ui/NeonComponents';
import AuthContext from '../context/AuthContext';
import EventDetailModal from './EventDetailModal';
import axios from 'axios';
import { API_URL } from '../api_config';

const GENRE_OPTIONS = ['all', 'tech', 'cultural', 'sports', 'academic', 'social', 'other'];
const TIME_OPTIONS = ['all', 'upcoming', 'past'];

const BrowseEvents = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [organizers, setOrganizers] = useState([]);
    const [search, setSearch] = useState('');
    const [genreFilter, setGenreFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming');
    const [organizerFilter, setOrganizerFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [detailEvent, setDetailEvent] = useState(null);

    useEffect(() => { fetchOrganizers(); fetchEvents(); }, [genreFilter, timeFilter, organizerFilter]);

    const fetchOrganizers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/auth/organizers`, { headers: { Authorization: `Bearer ${token}` } });
            setOrganizers(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (genreFilter !== 'all') params.append('genre', genreFilter);
            if (timeFilter !== 'all') params.append('timeFilter', timeFilter);
            if (search) params.append('search', search);
            if (organizerFilter) params.append('organizer', organizerFilter);
            const res = await axios.get(`${API_URL}/api/events?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
            setEvents(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); fetchEvents(); };

    const handleRegister = async (eventId, formResponses = []) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/events/${eventId}/register`, { formResponses }, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.pending ? '⏳ Registration submitted! Awaiting organizer approval.' : '✓ Registered!');
            fetchEvents();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const isRegistered = (event) => event.registrations?.includes(user?._id || user?.id);

    const chipStyle = (active, color = 'var(--neon-cyan)') => ({
        padding: '0.3rem 0.7rem', borderRadius: '14px', cursor: 'pointer', fontSize: '0.85rem',
        fontWeight: active ? '700' : '400', transition: 'all 0.2s', border: 'none',
        background: active ? color : 'rgba(255,255,255,0.05)',
        color: active ? (color === 'var(--neon-magenta)' ? '#fff' : '#000') : 'var(--text-dim)',
        outline: active ? `1px solid ${color}` : '1px solid transparent',
    });

    return (
        <>
            <div style={{ padding: '1.5rem 2rem', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                <h2 style={{ marginBottom: '1.2rem' }}>
                    <span style={{ background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Browse Events</span>
                </h2>

                {/* Filters */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem',
                    padding: '1rem', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
                    alignItems: 'center',
                }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.4rem', flex: '1 1 220px', alignItems: 'stretch' }}>
                        <NeonInput placeholder="Search events, clubs..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: '0.7rem 1rem', fontSize: '0.95rem' }} />
                        <button type="submit" style={{
                            padding: '0 0.8rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
                            background: 'var(--neon-cyan)', color: '#000', border: 'none', whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>🔍</button>
                    </form>

                    <select value={organizerFilter} onChange={e => setOrganizerFilter(e.target.value)} style={{
                        padding: '0.55rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)', color: 'var(--text-color)', fontSize: '0.9rem',
                        outline: 'none', cursor: 'pointer', appearance: 'auto',
                    }}>
                        <option value="" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>All Clubs</option>
                        {organizers.map(o => <option key={o._id} value={o._id} style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>{o.organizerName || 'Unknown'}</option>)}
                    </select>

                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {GENRE_OPTIONS.map(g => (
                            <button key={g} onClick={() => setGenreFilter(g)} style={chipStyle(genreFilter === g)}>{g === 'all' ? 'All' : g}</button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {TIME_OPTIONS.map(t => (
                            <button key={t} onClick={() => setTimeFilter(t)} style={chipStyle(timeFilter === t, 'var(--neon-magenta)')}>{t === 'all' ? 'All' : t}</button>
                        ))}
                    </div>
                </div>

                {/* Events */}
                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Loading...</p>
                ) : events.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No events found.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1.1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))' }}>
                        {events.map(event => (
                            <NeonCard key={event._id} title={event.title} variant={new Date(event.startDate || event.date) < new Date() ? 'pure-black' : 'default'}
                                style={{ cursor: 'pointer' }} onClick={() => setDetailEvent(event)}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', margin: 0 }}>{event.description?.substring(0, 110)}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                                        <span>📅 {new Date(event.startDate || event.date).toLocaleDateString()}</span>
                                        <span>📍 {event.venue}</span>
                                        <span style={{ textTransform: 'capitalize' }}>🎭 {event.genre}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '0.3rem' }}>
                                        <span style={{ color: 'var(--text-dim)' }}>👥 {event.registrations?.length || 0}/{event.capacity}</span>
                                        <span style={{ color: 'var(--text-dim)' }}>🏢 {event.organizer?.organizerName || event.organizer?.name || 'Unknown'}</span>
                                    </div>
                                    {event.registrationFee > 0 && <span style={{ fontSize: '0.82rem', color: 'var(--neon-magenta)', fontWeight: '600' }}>₹{event.registrationFee}</span>}
                                    {user?.role === 'participant' && new Date(event.startDate || event.date) >= new Date() && (
                                        <div style={{ marginTop: '0.3rem' }}>
                                            {isRegistered(event) ? (
                                                <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '0.85rem' }}>✓ Registered</span>
                                            ) : (
                                                <NeonButton onClick={(e) => { e.stopPropagation(); setDetailEvent(event); }} style={{ fontSize: '0.82rem', padding: '0.3rem 0.8rem' }}>Register</NeonButton>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </NeonCard>
                        ))}
                    </div>
                )}
            </div>

            {/* Event Detail Modal */}
            {
                detailEvent && (
                    <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} onRegister={async (id, formResponses) => { await handleRegister(id, formResponses); setDetailEvent(null); }} />
                )
            }
        </>
    );
};

export default BrowseEvents;
