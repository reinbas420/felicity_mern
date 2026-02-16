import React, { useState, useEffect, useContext } from 'react';
import { NeonCard, NeonButton, NeonInput } from './ui/NeonComponents';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const GENRE_OPTIONS = ['all', 'tech', 'cultural', 'sports', 'academic', 'social', 'other'];
const TIME_OPTIONS = ['all', 'upcoming', 'past'];

const BrowseEvents = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [genreFilter, setGenreFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('upcoming');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [genreFilter, timeFilter]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (genreFilter !== 'all') params.append('genre', genreFilter);
            if (timeFilter !== 'all') params.append('timeFilter', timeFilter);
            if (search) params.append('search', search);

            const res = await axios.get(`http://localhost:5000/api/events?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(res.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEvents();
    };

    const handleRegister = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Registered for event successfully!');
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        }
    };

    const isRegistered = (event) => {
        return event.registrations && event.registrations.includes(user?._id || user?.id);
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className="neon-text" style={{ marginBottom: '1.5rem' }}>Browse Events</h2>

            {/* Search & Filters */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '2rem',
                alignItems: 'center',
                padding: '1.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                background: 'var(--bg-card)'
            }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
                    <NeonInput
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <NeonButton type="submit" style={{ whiteSpace: 'nowrap' }}>Search</NeonButton>
                </form>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {GENRE_OPTIONS.map(g => (
                        <button
                            key={g}
                            onClick={() => setGenreFilter(g)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                border: `1px solid ${genreFilter === g ? 'var(--neon-cyan)' : 'var(--border-color)'}`,
                                background: genreFilter === g ? 'var(--neon-cyan)' : 'transparent',
                                color: genreFilter === g ? '#000' : 'var(--text-color)',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontSize: '0.8rem',
                                fontWeight: genreFilter === g ? '700' : '400',
                                transition: 'all 0.2s',
                            }}
                        >
                            {g}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {TIME_OPTIONS.map(t => (
                        <button
                            key={t}
                            onClick={() => setTimeFilter(t)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                border: `1px solid ${timeFilter === t ? 'var(--neon-magenta)' : 'var(--border-color)'}`,
                                background: timeFilter === t ? 'var(--neon-magenta)' : 'transparent',
                                color: timeFilter === t ? '#fff' : 'var(--text-color)',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontSize: '0.8rem',
                                fontWeight: timeFilter === t ? '700' : '400',
                                transition: 'all 0.2s',
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events List */}
            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Loading events...</p>
            ) : events.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No events found.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {events.map(event => (
                        <NeonCard key={event._id} title={event.title} variant={new Date(event.date) < new Date() ? 'pure-black' : 'default'}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', margin: 0 }}>{event.description}</p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                                    <span>📍 {event.venue}</span>
                                    <span style={{ textTransform: 'capitalize' }}>🎭 {event.genre}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-dim)' }}>
                                        👥 {event.registrations?.length || 0}/{event.capacity} registered
                                    </span>
                                    <span style={{ color: 'var(--text-dim)' }}>
                                        By: {event.organizer?.name || 'Unknown'}
                                    </span>
                                </div>

                                {user?.role === 'participant' && new Date(event.date) >= new Date() && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        {isRegistered(event) ? (
                                            <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '0.85rem' }}>✓ Registered</span>
                                        ) : (
                                            <NeonButton onClick={() => handleRegister(event._id)} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                                                Register
                                            </NeonButton>
                                        )}
                                    </div>
                                )}
                            </div>
                        </NeonCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrowseEvents;
