import React, { useState, useEffect, useContext } from 'react';
import { NeonCard, NeonButton } from '../ui/NeonComponents';
import AuthContext from '../../context/AuthContext';
import { FelicityLogo } from '../../layouts/MainLayout';
import EventDetailModal from '../EventDetailModal';
import axios from 'axios';

const ParticipantDashboard = () => {
    const { user } = useContext(AuthContext);
    const [trending, setTrending] = useState([]);
    const [registered, setRegistered] = useState([]);
    const [followed, setFollowed] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrEvent, setQrEvent] = useState(null);
    const [detailEvent, setDetailEvent] = useState(null);
    const [historyTab, setHistoryTab] = useState('all');

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [t, r, f, h] = await Promise.all([
                axios.get('http://localhost:5000/api/events/trending', { headers }),
                axios.get('http://localhost:5000/api/events/my-registered', { headers }),
                axios.get('http://localhost:5000/api/events/followed', { headers }),
                axios.get('http://localhost:5000/api/events/history', { headers }),
            ]);
            setTrending(t.data); setRegistered(r.data); setFollowed(f.data); setHistory(h.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleRegister = async (eventId, formResponses = []) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/events/${eventId}/register`, { formResponses }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.pending) {
                alert('⏳ Registration submitted! Awaiting organizer approval.');
            }
            setDetailEvent(null);
            fetchAll();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const isRegistered = (event) => event.registrations?.includes(user?._id || user?.id);
    const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'User';

    const getQrUrl = (event) => {
        const data = encodeURIComponent(JSON.stringify({ eventId: event._id, userId: user?._id, event: event.title, user: displayName }));
        return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${data}`;
    };

    /* ─── Participation History Tabs ─── */
    const historyTabs = [
        { key: 'all', label: 'All' },
        { key: 'normal', label: 'Normal' },
        { key: 'merchandise', label: 'Merchandise' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' },
    ];

    const getFilteredHistory = () => {
        if (historyTab === 'all') return history;
        if (historyTab === 'normal') return history.filter(e => e.eventType === 'normal');
        if (historyTab === 'merchandise') return history.filter(e => e.eventType === 'merchandise');
        if (historyTab === 'completed') return history.filter(e => e.attendance?.includes(user?._id || user?.id));
        if (historyTab === 'cancelled') return []; // placeholder — no cancellation mechanism yet
        return history;
    };

    const EventCard = ({ event, showRegister = true, showQr = false }) => (
        <div
            onClick={() => setDetailEvent(event)}
            style={{
                padding: '1.4rem', border: '1px solid var(--border-color)', borderRadius: '16px',
                background: 'var(--bg-card)', cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,243,255,0.3)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,243,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--neon-cyan)', fontSize: '1.1rem' }}>{event.title}</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>{event.description?.substring(0, 100)}{event.description?.length > 100 ? '...' : ''}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                <span>📅 {new Date(event.startDate || event.date).toLocaleDateString()}</span>
                <span>📍 {event.venue}</span>
                <span style={{ textTransform: 'capitalize' }}>🎭 {event.genre}</span>
                <span>👥 {event.registrations?.length || 0}/{event.capacity}</span>
            </div>
            {event.organizer && <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.3rem 0 0' }}>By: {event.organizer.organizerName || event.organizer.name}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                {showRegister && !isRegistered(event) && new Date(event.startDate || event.date) >= new Date() && (
                    <NeonButton onClick={() => setDetailEvent(event)} style={{ fontSize: '0.82rem', padding: '0.3rem 0.8rem' }}>Register</NeonButton>
                )}
                {isRegistered(event) && (
                    <>
                        <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '0.85rem' }}>✓ Registered</span>
                        {showQr && <button onClick={() => setQrEvent(event)} style={{ background: 'transparent', border: '1px solid var(--neon-magenta)', color: 'var(--neon-magenta)', padding: '0.25rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>QR</button>}
                    </>
                )}
            </div>
        </div>
    );

    const Section = ({ title, events, emptyMsg, showRegister = true, showQr = false }) => (
        <div style={{ marginBottom: '2.2rem' }}>
            <h3 style={{ marginBottom: '0.9rem', fontSize: '1.25rem' }}>{title}</h3>
            {events.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>{emptyMsg}</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
                    {events.map(e => <EventCard key={e._id} event={e} showRegister={showRegister} showQr={showQr} />)}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
            {/* Rounded Hi Banner */}
            <div style={{ padding: '1.2rem 2rem', boxSizing: 'border-box' }}>
                <div style={{
                    padding: '1.5rem 2rem', borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(0,243,255,0.08), rgba(218,0,255,0.08))',
                    border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem',
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.85rem' }}>
                            Hi, <span style={{ background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{displayName}</span> 👋
                        </h1>
                        <p style={{ margin: '0.3rem 0 0', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                            Welcome to <FelicityLogo size="1rem" /> 2026
                        </p>
                    </div>
                    {user?.genres?.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {user.genres.map(g => (
                                <span key={g} style={{ padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', background: 'rgba(0,243,255,0.1)', color: 'var(--neon-cyan)', border: '1px solid rgba(0,243,255,0.3)', textTransform: 'capitalize' }}>{g}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '0.5rem 2rem 1.5rem', boxSizing: 'border-box', width: '100%' }}>
                {loading ? (
                    <p style={{ color: 'var(--text-dim)' }}>Loading...</p>
                ) : (
                    <>
                        <Section title="🔥 Trending Events" events={trending} emptyMsg="No trending events right now." />
                        <Section title="📋 Your Upcoming Registered Events" events={registered} emptyMsg="You haven't registered for any upcoming events." showRegister={false} showQr={true} />
                        <Section title="🏢 From Clubs You Follow" events={followed} emptyMsg="Follow clubs to see their events here." />

                        {/* Participation History with Tabs */}
                        <div style={{ marginBottom: '2.2rem' }}>
                            <h3 style={{ marginBottom: '0.9rem', fontSize: '1.25rem' }}>📜 Participation History</h3>
                            <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                {historyTabs.map(tab => (
                                    <button key={tab.key} onClick={() => setHistoryTab(tab.key)} style={{
                                        padding: '0.45rem 0.9rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                        fontSize: '0.88rem', fontWeight: historyTab === tab.key ? '700' : '400',
                                        background: historyTab === tab.key ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.05)',
                                        color: historyTab === tab.key ? '#000' : 'var(--text-dim)',
                                        transition: 'all 0.2s',
                                    }}>{tab.label}</button>
                                ))}
                            </div>
                            {getFilteredHistory().length === 0 ? (
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                                    {historyTab === 'cancelled' ? 'No cancelled or rejected events.' : 'No past events in this category.'}
                                </p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
                                    {getFilteredHistory().map(e => <EventCard key={e._id} event={e} showRegister={false} showQr={true} />)}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* QR Modal */}
            {qrEvent && (
                <div onClick={() => setQrEvent(null)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'var(--bg-color)', border: '1px solid var(--neon-cyan)', borderRadius: '16px', padding: '2rem',
                        textAlign: 'center', maxWidth: '350px',
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--neon-cyan)' }}>{qrEvent.title}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>Scan to verify attendance</p>
                        <img src={getQrUrl(qrEvent)} alt="QR Code" style={{ width: '180px', height: '180px', borderRadius: '8px' }} />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.8rem' }}>{displayName} — {user?.email}</p>
                        <NeonButton onClick={() => setQrEvent(null)} style={{ marginTop: '1rem', fontSize: '0.8rem' }}>Close</NeonButton>
                    </div>
                </div>
            )}

            {/* Event Detail Modal */}
            {detailEvent && (
                <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} onRegister={handleRegister} />
            )}
        </div>
    );
};

export default ParticipantDashboard;
