import React, { useContext, useState } from 'react';
import { NeonButton } from './ui/NeonComponents';
import AuthContext from '../context/AuthContext';
import FormRenderer from './FormRenderer';

const EventDetailModal = ({ event, onClose, onRegister }) => {
    const { user } = useContext(AuthContext);
    const [showForm, setShowForm] = useState(false);
    const [registering, setRegistering] = useState(false);
    if (!event) return null;

    const start = new Date(event.startDate || event.date);
    const end = event.endDate ? new Date(event.endDate) : start;
    const now = new Date();
    const status = event.status === 'draft' ? 'Draft' : now < start ? 'Upcoming' : now <= end ? 'Ongoing' : 'Completed';
    const statusColor = { Draft: '#888', Upcoming: 'var(--neon-cyan)', Ongoing: '#f59e0b', Completed: 'var(--neon-magenta)' }[status];

    const isRegistered = event.registrations?.includes(user?._id || user?.id);
    const isFull = (event.registrations?.length || 0) >= event.capacity;

    const hasCustomForm = event.customFormFields && event.customFormFields.length > 0;

    const handleRegisterClick = () => {
        if (hasCustomForm) {
            setShowForm(true);
        } else {
            onRegister(event._id, []);
        }
    };

    const handleFormSubmit = async (formResponses) => {
        setRegistering(true);
        try {
            await onRegister(event._id, formResponses);
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1rem',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: 'var(--bg-color)', border: '1px solid var(--neon-cyan)',
                borderRadius: '20px', padding: '2rem', maxWidth: '560px', width: '100%',
                maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 0 40px rgba(0,243,255,0.15)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.3rem 0' }}>
                            <span style={{ background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{event.title}</span>
                        </h2>
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '10px', fontWeight: '700', color: statusColor, border: `1px solid ${statusColor}` }}>{status}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--neon-magenta)', fontSize: '1.3rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>

                {/* Description */}
                {event.description && (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>{event.description}</p>
                )}

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
                    {[
                        { label: 'Type', val: event.eventType, icon: '📋' },
                        { label: 'Genre', val: event.genre, icon: '🎭' },
                        { label: 'Start', val: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), icon: '📅' },
                        { label: 'End', val: end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), icon: '📅' },
                        { label: 'Venue', val: event.venue, icon: '📍' },
                        { label: 'Eligibility', val: event.eligibility === 'iiit_only' ? 'IIIT Only' : 'All', icon: '🎓' },
                        { label: 'Fee', val: event.registrationFee > 0 ? `₹${event.registrationFee}` : 'Free', icon: '💰' },
                        { label: 'Capacity', val: `${event.registrations?.length || 0} / ${event.capacity}`, icon: '👥' },
                    ].map(item => (
                        <div key={item.label} style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                            <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-dim)' }}>{item.icon} {item.label}</p>
                            <p style={{ margin: '0.15rem 0 0', fontWeight: '600', fontSize: '0.85rem', textTransform: 'capitalize' }}>{item.val || '—'}</p>
                        </div>
                    ))}
                </div>

                {/* Organizer */}
                {event.organizer && (
                    <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-dim)' }}>Organized by</p>
                        <p style={{ margin: '0.15rem 0 0', fontWeight: '600', fontSize: '0.88rem', color: 'var(--neon-cyan)' }}>{event.organizer.organizerName || event.organizer.name || 'Unknown'}</p>
                    </div>
                )}

                {/* Tags */}
                {event.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {event.tags.map(t => (
                            <span key={t} style={{ padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', background: 'rgba(218,0,255,0.1)', color: 'var(--neon-magenta)', border: '1px solid rgba(218,0,255,0.3)' }}>{t}</span>
                        ))}
                    </div>
                )}

                {/* Merchandise items */}
                {event.eventType === 'merchandise' && event.merchandiseItems?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--neon-cyan)' }}>Merchandise Items</h4>
                        {event.merchandiseItems.map((item, i) => (
                            <div key={i} style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', marginBottom: '0.4rem' }}>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.85rem' }}>{item.itemName} — ₹{item.price}</p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                                    {item.sizes?.length > 0 && <span>Sizes: {item.sizes.join(', ')}</span>}
                                    {item.colors?.length > 0 && <span>Colors: {item.colors.join(', ')}</span>}
                                    <span>Stock: {item.stockQuantity}</span>
                                    <span>Limit: {item.purchaseLimitPerUser}/person</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Custom Form — shown when user clicks Register and event has form fields */}
                {showForm && hasCustomForm && (
                    <div style={{ marginBottom: '1rem' }}>
                        <FormRenderer
                            fields={event.customFormFields}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setShowForm(false)}
                            submitting={registering}
                        />
                    </div>
                )}

                {/* Action buttons */}
                {!showForm && (
                    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                        {user?.role === 'participant' && !isRegistered && !isFull && status !== 'Completed' && onRegister && (
                            <NeonButton onClick={handleRegisterClick} style={{ fontSize: '0.85rem' }}>Register</NeonButton>
                        )}
                        {isRegistered && <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>✓ Registered</span>}
                        {isFull && !isRegistered && <span style={{ color: 'var(--neon-magenta)', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>Event Full</span>}
                        <NeonButton onClick={onClose} style={{ fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>Close</NeonButton>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetailModal;

