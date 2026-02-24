import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NeonCard, NeonButton } from './ui/NeonComponents';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const ClubDetailPage = () => {
    const { id } = useParams();
    const { user, setUser } = useContext(AuthContext);
    const [club, setClub] = useState(null);
    const [upcoming, setUpcoming] = useState([]);
    const [past, setPast] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchClub(); }, [id]);

    const fetchClub = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Get all organizers, find this one
            const orgRes = await axios.get('http://localhost:5000/api/auth/organizers', { headers });
            const found = orgRes.data.find(o => o._id === id);
            setClub(found);

            // Get events from this organizer
            const upRes = await axios.get(`http://localhost:5000/api/events?organizer=${id}&timeFilter=upcoming`, { headers });
            setUpcoming(upRes.data);
            const pastRes = await axios.get(`http://localhost:5000/api/events?organizer=${id}&timeFilter=past`, { headers });
            setPast(pastRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleFollow = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/auth/follow/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setUser(prev => ({ ...prev, followedOrganizers: res.data.followedOrganizers }));
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    const handleRegister = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert('Registered!');
            fetchClub();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const isFollowing = user?.followedOrganizers?.includes(id);
    const isRegistered = (event) => event.registrations?.includes(user?._id || user?.id);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading...</div>;
    if (!club) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Club not found. <Link to="/clubs" style={{ color: 'var(--neon-cyan)' }}>Back to Clubs</Link></div>;

    const EventRow = ({ event, showRegister }) => (
        <div style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, color: 'var(--neon-cyan)', fontSize: '0.9rem' }}>{event.title}</h4>
                <span style={{ fontSize: '0.7rem', textTransform: 'capitalize', padding: '0.1rem 0.5rem', borderRadius: '10px', background: 'rgba(0,243,255,0.1)', color: 'var(--neon-cyan)', border: '1px solid rgba(0,243,255,0.3)' }}>{event.genre}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.3rem 0' }}>{event.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                <span>📅 {new Date(event.startDate || event.date).toLocaleDateString()}</span>
                <span>📍 {event.venue}</span>
                <span>👥 {event.registrations?.length || 0}/{event.capacity}</span>
                {event.registrationFee > 0 && <span>₹{event.registrationFee}</span>}
            </div>
            {showRegister && user?.role === 'participant' && (
                <div style={{ marginTop: '0.4rem' }}>
                    {isRegistered(event) ? (
                        <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '0.75rem' }}>✓ Registered</span>
                    ) : (
                        <NeonButton onClick={() => handleRegister(event._id)} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>Register</NeonButton>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Club Header */}
            <div style={{
                padding: '2rem', borderRadius: '16px', marginBottom: '2rem',
                background: 'linear-gradient(135deg, rgba(0,243,255,0.08), rgba(218,0,255,0.08))',
                border: '1px solid var(--border-color)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.3rem 0' }}>
                            <span style={{ background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{club.organizerName || 'Unknown Club'}</span>
                        </h2>
                        {club.category && (
                            <span style={{ display: 'inline-block', padding: '0.2rem 0.7rem', borderRadius: '12px', fontSize: '0.75rem', background: 'rgba(0,243,255,0.1)', color: 'var(--neon-cyan)', border: '1px solid rgba(0,243,255,0.3)', textTransform: 'capitalize', marginBottom: '0.5rem' }}>{club.category}</span>
                        )}
                    </div>
                    <NeonButton onClick={handleFollow} style={{
                        ...(isFollowing ? { background: 'var(--neon-magenta)', color: '#fff', borderColor: 'var(--neon-magenta)' } : {}),
                    }}>
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </NeonButton>
                </div>

                {club.description && <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: '0.8rem 0 0' }}>{club.description}</p>}

                {/* Contact Info */}
                <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: '600', margin: '0 0 0.3rem 0' }}>Contact</p>
                    {club.contactEmail && <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>✉ {club.contactEmail}</p>}
                </div>
            </div>

            {/* Events */}
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                <NeonCard title={`Upcoming Events (${upcoming.length})`}>
                    {upcoming.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No upcoming events.</p>
                    ) : upcoming.map(e => <EventRow key={e._id} event={e} showRegister={true} />)}
                </NeonCard>

                <NeonCard title={`Past Events (${past.length})`} variant="pure-black">
                    {past.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No past events.</p>
                    ) : past.map(e => <EventRow key={e._id} event={e} showRegister={false} />)}
                </NeonCard>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link to="/clubs" style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem' }}>← Back to all Clubs</Link>
            </div>
        </div>
    );
};

export default ClubDetailPage;
