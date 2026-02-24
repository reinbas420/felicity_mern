import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NeonCard, NeonButton, NeonInput } from '../ui/NeonComponents';
import axios from 'axios';
import { API_URL } from '../../api_config';

const AdminDashboard = () => {
    const [upcoming, setUpcoming] = useState([]);
    const [past, setPast] = useState([]);
    const [organizers, setOrganizers] = useState([]);
    const [pendingResets, setPendingResets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create organizer state
    const [showCreateOrg, setShowCreateOrg] = useState(false);
    const [orgForm, setOrgForm] = useState({ organizerName: '', email: '', password: '', category: '', description: '', contactEmail: '' });

    // Email state
    const [showEmail, setShowEmail] = useState(false);
    const [emailTo, setEmailTo] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [emailStatus, setEmailStatus] = useState('');

    // Participant search state
    const [userQuery, setUserQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeout = useRef(null);
    const dropdownRef = useRef(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchAll(); }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchAll = async () => {
        try {
            const [evRes, orgRes, resetRes] = await Promise.all([
                axios.get(`${API_URL}/api/events/admin/all`, { headers }),
                axios.get(`${API_URL}/api/auth/organizers`, { headers }),
                axios.get(`${API_URL}/api/auth/admin/pending-resets`, { headers }).catch(() => ({ data: [] })),
            ]);
            setUpcoming(evRes.data.upcoming || []);
            setPast(evRes.data.past || []);
            setOrganizers(orgRes.data);
            setPendingResets(resetRes.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    // Debounced search
    const handleUserSearch = useCallback((query) => {
        setUserQuery(query);
        setSelectedUser(null);
        setEmailTo('');
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (!query.trim()) { setSearchResults([]); setShowDropdown(false); return; }
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await axios.get(`${API_URL}/api/auth/admin/search-participants?q=${encodeURIComponent(query)}`, { headers });
                setSearchResults(res.data);
                setShowDropdown(res.data.length > 0);
            } catch (err) { console.error(err); setSearchResults([]); }
        }, 300);
    }, []);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setEmailTo(user.email);
        setUserQuery(`${user.firstName || ''} ${user.lastName || ''}`.trim());
        setShowDropdown(false);
    };

    const handleCreateOrganizer = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/auth/create-organizer`, orgForm, { headers });
            setOrgForm({ organizerName: '', email: '', password: '', category: '', description: '', contactEmail: '' });
            setShowCreateOrg(false);
            fetchAll();
        } catch (err) { alert(err.response?.data?.message || 'Failed to create organizer'); }
    };

    const handleDeleteOrganizer = async (id, name) => {
        if (!window.confirm(`Delete organizer "${name}" and ALL their events?`)) return;
        try {
            await axios.delete(`${API_URL}/api/auth/organizer/${id}`, { headers });
            fetchAll();
        } catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setEmailStatus('Sending...');
        try {
            await axios.post(`${API_URL}/api/auth/admin/send-email`,
                { to: emailTo, subject: emailSubject, message: emailMessage }, { headers });
            setEmailStatus('Email sent successfully!');
            setEmailTo(''); setEmailSubject(''); setEmailMessage('');
            setUserQuery(''); setSelectedUser(null);
        } catch (err) { setEmailStatus(err.response?.data?.message || 'Failed'); }
    };

    const handleDeleteEvent = async (id, title) => {
        if (!window.confirm(`Delete event "${title}" and all its registrations?`)) return;
        try {
            await axios.delete(`${API_URL}/api/events/${id}`, { headers });
            fetchAll();
        } catch (err) { alert(err.response?.data?.message || 'Failed to delete event'); }
    };

    const EventRow = ({ event }) => (
        <div style={{ padding: '0.7rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, color: 'var(--neon-cyan)', fontSize: '1.05rem' }}>{event.title}</h4>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ padding: '0.12rem 0.4rem', borderRadius: '10px', fontSize: '0.65rem', textTransform: 'capitalize', background: 'rgba(0,243,255,0.1)', color: 'var(--neon-cyan)', border: '1px solid rgba(0,243,255,0.3)', whiteSpace: 'nowrap' }}>{event.genre}</span>
                    <button onClick={() => handleDeleteEvent(event._id, event.title)} style={{
                        background: 'transparent', border: '1px solid var(--neon-magenta)', color: 'var(--neon-magenta)',
                        padding: '0.15rem 0.45rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: '700',
                    }}>✕</button>
                </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                <span>📅 {new Date(event.startDate || event.date).toLocaleDateString()}</span>
                <span>📍 {event.venue}</span>
                <span>👤 {event.organizer?.organizerName || event.organizer?.name || 'N/A'}</span>
                <span>👥 {event.registrations?.length || 0}/{event.capacity}</span>
            </div>
        </div>
    );

    if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>Loading...</p>;

    return (
        <div style={{ padding: '2rem', width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>
                <span style={{ background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Dashboard</span>
            </h2>

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>

                {/* Manage Clubs / Organizers */}
                <NeonCard title="Clubs / Organizers">
                    <NeonButton onClick={() => setShowCreateOrg(!showCreateOrg)} style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {showCreateOrg ? 'Cancel' : '+ Add New Club'}
                    </NeonButton>

                    {showCreateOrg && (
                        <form onSubmit={handleCreateOrganizer} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1rem', padding: '1rem', border: '1px solid var(--neon-cyan)', borderRadius: '12px', background: 'rgba(0,243,255,0.03)' }}>
                            <NeonInput placeholder="Club / Organizer Name *" value={orgForm.organizerName} onChange={e => setOrgForm({ ...orgForm, organizerName: e.target.value })} required />
                            <NeonInput type="email" placeholder="Login Email *" value={orgForm.email} onChange={e => setOrgForm({ ...orgForm, email: e.target.value })} required />
                            <NeonInput type="password" placeholder="Password *" value={orgForm.password} onChange={e => setOrgForm({ ...orgForm, password: e.target.value })} required />
                            <NeonInput placeholder="Category (e.g. Tech, Cultural)" value={orgForm.category} onChange={e => setOrgForm({ ...orgForm, category: e.target.value })} />
                            <NeonInput placeholder="Description" value={orgForm.description} onChange={e => setOrgForm({ ...orgForm, description: e.target.value })} />
                            <NeonInput placeholder="Contact Email" value={orgForm.contactEmail} onChange={e => setOrgForm({ ...orgForm, contactEmail: e.target.value })} />
                            <NeonButton type="submit" style={{ fontSize: '0.85rem' }}>Create Club Account</NeonButton>
                        </form>
                    )}

                    {organizers.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No organizers yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {organizers.map(org => (
                                <div key={org._id} style={{ padding: '0.7rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontWeight: '600', fontSize: '1.0rem' }}>{org.organizerName || 'Unknown'}</span>
                                        {org.category && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '8px', background: 'rgba(0,243,255,0.1)', color: 'var(--neon-cyan)' }}>{org.category}</span>}
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-dim)' }}>{org.contactEmail || org.email}</p>
                                    </div>
                                    <button onClick={() => handleDeleteOrganizer(org._id, org.organizerName)} style={{
                                        background: 'transparent', border: '1px solid var(--neon-magenta)', color: 'var(--neon-magenta)',
                                        padding: '0.25rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold',
                                    }}>Delete</button>
                                </div>
                            ))}
                        </div>
                    )}
                </NeonCard>

                {/* Events */}
                <NeonCard title={`Upcoming Events (${upcoming.length})`}>
                    {upcoming.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No upcoming events.</p> : upcoming.map(e => <EventRow key={e._id} event={e} />)}
                </NeonCard>

                <NeonCard title={`Past Events (${past.length})`} variant="pure-black">
                    {past.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No past events.</p> : past.map(e => <EventRow key={e._id} event={e} />)}
                </NeonCard>

                {/* Stats */}
                <NeonCard title="System Stats">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {[
                            { label: 'Clubs / Organizers', val: organizers.length, color: 'var(--neon-purple)' },
                            { label: 'Total Events', val: upcoming.length + past.length, color: 'var(--neon-cyan)' },
                            { label: 'Upcoming', val: upcoming.length, color: 'var(--neon-cyan)' },
                            { label: 'Completed', val: past.length, color: 'var(--neon-magenta)' },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{s.label}</span>
                                <span style={{ color: s.color, fontSize: '1.5rem', fontWeight: '700' }}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </NeonCard>

                {/* Pending Password Resets */}
                {pendingResets.length > 0 && (
                    <NeonCard title={`Pending Password Resets (${pendingResets.length})`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {pendingResets.map(pr => (
                                <div key={pr._id} style={{ padding: '0.7rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{pr.organizerName || 'Unknown'}</span>
                                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{pr.email}</p>
                                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.68rem', color: 'var(--text-dim)' }}>Requested: {new Date(pr.passwordResetRequestedAt).toLocaleString()}</p>
                                        {pr.passwordResetReason && <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#f59e0b', fontStyle: 'italic' }}>Reason: "{pr.passwordResetReason}"</p>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                        <button onClick={async () => { await axios.post(`${API_URL}/api/auth/admin/approve-reset/${pr._id}`, {}, { headers }); fetchAll(); }} style={{ background: 'var(--neon-cyan)', color: '#000', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>Approve</button>
                                        <button onClick={async () => { await axios.post(`${API_URL}/api/auth/admin/reject-reset/${pr._id}`, {}, { headers }); fetchAll(); }} style={{ background: 'transparent', color: 'var(--neon-magenta)', border: '1px solid var(--neon-magenta)', padding: '0.25rem 0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </NeonCard>
                )}

                {/* Send Email */}
                <NeonCard title="Send Email to Participant">
                    <NeonButton onClick={() => setShowEmail(!showEmail)} style={{ fontSize: '0.85rem', marginBottom: showEmail ? '1rem' : 0 }}>
                        {showEmail ? 'Cancel' : '✉ Compose Email'}
                    </NeonButton>
                    {showEmail && (
                        <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                            {/* Search participant by name */}
                            <div ref={dropdownRef} style={{ position: 'relative' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem', display: 'block' }}>Search participant by name</label>
                                <NeonInput
                                    placeholder="Type a name to search..."
                                    value={userQuery}
                                    onChange={e => handleUserSearch(e.target.value)}
                                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                                />
                                {showDropdown && searchResults.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                        background: '#1a1a1a', border: '1px solid var(--border-color)',
                                        borderRadius: '10px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                                    }}>
                                        {searchResults.map(u => (
                                            <div
                                                key={u._id}
                                                onClick={() => handleSelectUser(u)}
                                                style={{
                                                    padding: '0.6rem 0.9rem', cursor: 'pointer',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,243,255,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>
                                                    {u.firstName || ''} {u.lastName || ''}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{u.email}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected user badge */}
                            {selectedUser && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.4rem 0.7rem', borderRadius: '8px',
                                    background: 'rgba(0,243,255,0.08)', border: '1px solid rgba(0,243,255,0.25)',
                                    fontSize: '0.8rem',
                                }}>
                                    <span style={{ color: 'var(--neon-cyan)', fontWeight: '600' }}>
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </span>
                                    <span style={{ color: 'var(--text-dim)' }}>→</span>
                                    <span style={{ color: '#fff' }}>{selectedUser.email}</span>
                                    <button type="button" onClick={() => { setSelectedUser(null); setEmailTo(''); setUserQuery(''); }}
                                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--neon-magenta)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>×</button>
                                </div>
                            )}

                            {/* Email (auto-filled or manual) */}
                            <NeonInput type="email" placeholder="Recipient Email" value={emailTo} onChange={e => setEmailTo(e.target.value)} required />
                            <NeonInput placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} required />
                            <textarea placeholder="Message (supports HTML)" value={emailMessage} onChange={e => setEmailMessage(e.target.value)} required
                                style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                                    borderRadius: '12px', padding: '0.8rem', color: 'var(--text-color)', minHeight: '80px',
                                    fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                                }} />
                            <NeonButton type="submit" style={{ fontSize: '0.85rem' }}>Send Email</NeonButton>
                            {emailStatus && <p style={{ color: emailStatus.includes('success') ? 'var(--neon-cyan)' : 'var(--neon-magenta)', fontSize: '0.8rem', textAlign: 'center' }}>{emailStatus}</p>}
                        </form>
                    )}
                </NeonCard>
            </div>
        </div>
    );
};

export default AdminDashboard;
