import React, { useState, useEffect, useContext } from 'react';
import { NeonCard, NeonButton } from '../ui/NeonComponents';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';

const ParticipantDashboard = () => {
    const { user } = useContext(AuthContext);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommended();
    }, []);

    const fetchRecommended = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch upcoming events, then filter by user's genres on the client
            const res = await axios.get('http://localhost:5000/api/events?timeFilter=upcoming', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userGenres = user?.genres || [];
            let events = res.data;

            if (userGenres.length > 0) {
                // Prioritize: matching genres first, then others
                const matching = events.filter(e => userGenres.includes(e.genre));
                const others = events.filter(e => !userGenres.includes(e.genre));
                events = [...matching, ...others];
            }

            setRecommended(events.slice(0, 6)); // Top 6
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Registered successfully!');
            fetchRecommended();
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        }
    };

    const displayName = user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user?.name || 'Participant';

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2>Welcome, <span className="neon-text">{displayName}</span></h2>
                {user?.genres?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Your interests:</span>
                        {user.genres.map(g => (
                            <span key={g} style={{
                                padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem',
                                background: 'rgba(0,243,255,0.1)', color: 'var(--neon-cyan)',
                                border: '1px solid rgba(0,243,255,0.3)', textTransform: 'capitalize'
                            }}>{g}</span>
                        ))}
                    </div>
                )}
            </div>

            <h3 style={{ marginBottom: '1rem' }}>
                {user?.genres?.length > 0 ? '🎯 Recommended For You' : '📅 Upcoming Events'}
            </h3>

            {loading ? (
                <p style={{ color: 'var(--text-dim)' }}>Loading events...</p>
            ) : recommended.length === 0 ? (
                <p style={{ color: 'var(--text-dim)' }}>No upcoming events to show.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {recommended.map(event => {
                        const isMatch = user?.genres?.includes(event.genre);
                        const alreadyRegistered = event.registrations?.includes(user?._id || user?.id);

                        return (
                            <NeonCard key={event._id} title={event.title} variant={isMatch ? 'default' : 'pure-black'}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {isMatch && (
                                        <span style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)', fontWeight: '700' }}>★ MATCHES YOUR INTERESTS</span>
                                    )}
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>{event.description}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                        <span>📅 {new Date(event.startDate || event.date).toLocaleDateString()}</span>
                                        <span>📍 {event.venue}</span>
                                        <span style={{ textTransform: 'capitalize' }}>🎭 {event.genre}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                                        <span style={{ color: 'var(--text-dim)' }}>👥 {event.registrations?.length || 0}/{event.capacity}</span>
                                        {event.registrationFee > 0 && <span style={{ color: 'var(--neon-magenta)' }}>₹{event.registrationFee}</span>}
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        {alreadyRegistered ? (
                                            <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '0.85rem' }}>✓ Registered</span>
                                        ) : (
                                            <NeonButton onClick={() => handleRegister(event._id)} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>Register</NeonButton>
                                        )}
                                    </div>
                                </div>
                            </NeonCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ParticipantDashboard;
