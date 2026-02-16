import React, { useState, useEffect } from 'react';
import { NeonCard, NeonButton } from '../ui/NeonComponents';
import axios from 'axios';

const AdminDashboard = () => {
    const [upcoming, setUpcoming] = useState([]);
    const [past, setPast] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminEvents();
    }, []);

    const fetchAdminEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/events/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUpcoming(res.data.upcoming || []);
            setPast(res.data.past || []);
        } catch (error) {
            console.error('Error fetching admin events:', error);
        } finally {
            setLoading(false);
        }
    };

    const EventRow = ({ event }) => (
        <div style={{
            padding: '1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.02)',
            marginBottom: '0.5rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--neon-cyan)' }}>{event.title}</h4>
                    <p style={{ fontSize: '0.85rem', margin: '0 0 0.3rem 0', color: 'var(--text-dim)' }}>{event.description}</p>
                </div>
                <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    textTransform: 'capitalize',
                    background: 'rgba(0,243,255,0.1)',
                    color: 'var(--neon-cyan)',
                    border: '1px solid rgba(0,243,255,0.3)',
                    whiteSpace: 'nowrap'
                }}>
                    {event.genre}
                </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                <span>📍 {event.venue}</span>
                <span>👤 {event.organizer?.name || 'N/A'}</span>
                <span>👥 {event.registrations?.length || 0}/{event.capacity}</span>
            </div>
        </div>
    );

    if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Loading...</p>;

    return (
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
            <NeonCard title={`Upcoming Events (${upcoming.length})`}>
                {upcoming.length === 0 ? (
                    <p style={{ color: 'var(--text-dim)' }}>No upcoming events.</p>
                ) : (
                    upcoming.map(e => <EventRow key={e._id} event={e} />)
                )}
            </NeonCard>

            <NeonCard title={`Past Events (${past.length})`} variant="pure-black">
                {past.length === 0 ? (
                    <p style={{ color: 'var(--text-dim)' }}>No past events.</p>
                ) : (
                    past.map(e => <EventRow key={e._id} event={e} />)
                )}
            </NeonCard>

            <NeonCard title="System Stats">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Events</span>
                        <span className="neon-text" style={{ fontSize: '1.3rem' }}>{upcoming.length + past.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Upcoming</span>
                        <span style={{ color: 'var(--neon-cyan)', fontSize: '1.3rem' }}>{upcoming.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Completed</span>
                        <span style={{ color: 'var(--neon-magenta)', fontSize: '1.3rem' }}>{past.length}</span>
                    </div>
                </div>
            </NeonCard>
        </div>
    );
};

export default AdminDashboard;
