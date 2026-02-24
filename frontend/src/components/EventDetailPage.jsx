import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NeonCard, NeonButton, NeonInput } from './ui/NeonComponents';
import AuthContext from '../context/AuthContext';
import FormBuilder from './FormBuilder';
import axios from 'axios';
import { API_URL } from '../api_config';

const EventDetailPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFormBuilder, setShowFormBuilder] = useState(false);
    const [showEmailPanel, setShowEmailPanel] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [emailStatus, setEmailStatus] = useState('');
    const [emailSending, setEmailSending] = useState(false);

    useEffect(() => { fetchEvent(); }, [id]);

    const fetchEvent = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvent(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const markAttendance = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/events/${id}/attendance`, { userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEvent();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const exportCSV = () => {
        if (!event?.registrations) return;
        const headers = ['Name', 'Email', 'Contact', 'College', 'Type', 'Reg Date', 'Attended'];
        const rows = event.registrations.map(p => {
            const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || '';
            const attended = event.attendance?.some(a => (a._id || a) === p._id) ? 'Yes' : 'No';
            return [name, p.email || '', p.contactNumber || '', p.collegeName || '', p.participantType || '', new Date(p.createdAt || '').toLocaleDateString(), attended];
        });
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${event.title}_participants.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Loading...</p>;
    if (!event) return <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Event not found. <Link to="/dashboard" style={{ color: 'var(--neon-cyan)' }}>Back</Link></p>;

    const now = new Date();
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : start;
    const computedStatus = event.status === 'draft' ? 'Draft' : now < start ? 'Published' : now <= end ? 'Ongoing' : 'Closed';
    const statusColor = { 'Draft': '#888', 'Published': 'var(--neon-cyan)', 'Ongoing': '#f59e0b', 'Closed': 'var(--neon-magenta)' }[computedStatus];

    const attendanceIds = (event.attendance || []).map(a => a._id || a);
    const regs = event.registrations || [];
    const filteredRegs = regs.filter(p => {
        const name = `${p.firstName || ''} ${p.lastName || ''} ${p.name || ''} ${p.email || ''}`.toLowerCase();
        const matchSearch = name.includes(searchTerm.toLowerCase());
        if (filterStatus === 'attended') return matchSearch && attendanceIds.includes(p._id);
        if (filterStatus === 'not-attended') return matchSearch && !attendanceIds.includes(p._id);
        return matchSearch;
    });

    const totalRevenue = (regs.length) * (event.registrationFee || 0);

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <Link to="/dashboard" style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Dashboard</Link>

            {/* Overview */}
            <div style={{
                marginTop: '1rem', padding: '1.5rem', borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(0,243,255,0.06), rgba(218,0,255,0.06))',
                border: '1px solid var(--border-color)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                        <h2 style={{ margin: '0 0 0.3rem 0' }}>
                            <span style={{ background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{event.title}</span>
                        </h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>{event.description}</p>
                    </div>
                    <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.7rem', borderRadius: '12px', fontWeight: '700', color: statusColor, border: `1px solid ${statusColor}` }}>{computedStatus}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem', marginTop: '1rem' }}>
                    {[
                        { label: 'Type', val: event.eventType, icon: '📋' },
                        { label: 'Start', val: start.toLocaleDateString(), icon: '📅' },
                        { label: 'End', val: end.toLocaleDateString(), icon: '📅' },
                        { label: 'Venue', val: event.venue, icon: '📍' },
                        { label: 'Eligibility', val: event.eligibility === 'iiit_only' ? 'IIIT Only' : 'All', icon: '🎓' },
                        { label: 'Fee', val: event.registrationFee > 0 ? `₹${event.registrationFee}` : 'Free', icon: '💰' },
                    ].map(item => (
                        <div key={item.label} style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-dim)' }}>{item.icon} {item.label}</p>
                            <p style={{ margin: '0.2rem 0 0', fontWeight: '600', fontSize: '0.88rem', textTransform: 'capitalize' }}>{item.val}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                {[
                    { label: 'Registrations', val: regs.length, color: 'var(--neon-cyan)' },
                    { label: 'Capacity', val: `${regs.length}/${event.capacity}`, color: 'var(--neon-cyan)' },
                    { label: 'Attendance', val: attendanceIds.length, color: 'var(--neon-magenta)' },
                    { label: 'Revenue', val: `₹${totalRevenue}`, color: '#f59e0b' },
                    { label: 'Attendance %', val: regs.length > 0 ? `${Math.round(attendanceIds.length / regs.length * 100)}%` : '0%', color: 'var(--neon-purple)' },
                ].map(s => (
                    <NeonCard key={s.label}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.label}</p>
                        <p style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{s.val}</p>
                    </NeonCard>
                ))}
            </div>

            {/* Form Builder */}
            <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>
                        📝 Registration Form
                        {event.customFormFields?.length > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '400', marginLeft: '0.4rem' }}>({event.customFormFields.length} fields)</span>}
                    </h3>
                    <NeonButton onClick={() => setShowFormBuilder(!showFormBuilder)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                        {showFormBuilder ? 'Hide Form' : 'Edit Form'}
                    </NeonButton>
                </div>
                {showFormBuilder && (
                    <FormBuilder
                        fields={event.customFormFields || []}
                        formLocked={event.formLocked || false}
                        onSave={async (fields) => {
                            const token = localStorage.getItem('token');
                            const res = await axios.put(`${API_URL}/api/events/${id}/form`, { customFormFields: fields }, { headers: { Authorization: `Bearer ${token}` } });
                            alert(res.data.message || 'Form saved');
                            fetchEvent();
                        }}
                    />
                )}
            </div>

            {/* Email Participants */}
            <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>✉ Email Participants</h3>
                    <NeonButton onClick={() => { setShowEmailPanel(!showEmailPanel); setEmailStatus(''); }} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                        {showEmailPanel ? 'Hide' : 'Compose'}
                    </NeonButton>
                </div>
                {showEmailPanel && (
                    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-dim)' }}>Sending to <strong style={{ color: 'var(--neon-cyan)' }}>{regs.length}</strong> registered participant(s)</p>
                        <NeonInput placeholder="Subject *" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
                        <textarea placeholder="Message (supports HTML) *" value={emailMessage} onChange={e => setEmailMessage(e.target.value)}
                            style={{
                                width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                                borderRadius: '12px', padding: '0.8rem', color: 'var(--text-color)', fontSize: '0.85rem',
                                outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                            }} />
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <NeonButton disabled={emailSending || regs.length === 0} onClick={async () => {
                                if (!emailSubject.trim() || !emailMessage.trim()) { setEmailStatus('Subject and message are required.'); return; }
                                setEmailSending(true); setEmailStatus('Sending...');
                                try {
                                    const token = localStorage.getItem('token');
                                    const res = await axios.post(`${API_URL}/api/events/${id}/send-email`, { subject: emailSubject, message: emailMessage }, { headers: { Authorization: `Bearer ${token}` } });
                                    setEmailStatus(`✅ ${res.data.message}`);
                                    setEmailSubject(''); setEmailMessage('');
                                } catch (err) { setEmailStatus(`❌ ${err.response?.data?.message || 'Failed to send'}`); }
                                finally { setEmailSending(false); }
                            }} style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}>
                                {emailSending ? 'Sending...' : '📤 Send Email'}
                            </NeonButton>
                            {emailStatus && <span style={{ fontSize: '0.8rem', color: emailStatus.startsWith('✅') ? 'var(--neon-cyan)' : emailStatus === 'Sending...' ? 'var(--text-dim)' : 'var(--neon-magenta)' }}>{emailStatus}</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Participants */}
            <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                    <h3 style={{ margin: 0 }}>Participants ({regs.length})</h3>
                    <NeonButton onClick={exportCSV} style={{ fontSize: '0.78rem', padding: '0.3rem 0.8rem' }}>📥 Export CSV</NeonButton>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <NeonInput placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: '1 1 200px', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} />
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {['all', 'attended', 'not-attended'].map(f => (
                            <button key={f} onClick={() => setFilterStatus(f)} style={{
                                padding: '0.4rem 0.7rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.75rem',
                                fontWeight: filterStatus === f ? '700' : '400',
                                background: filterStatus === f ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.05)',
                                color: filterStatus === f ? '#000' : 'var(--text-dim)',
                            }}>{f === 'all' ? 'All' : f === 'attended' ? 'Attended' : 'Not Attended'}</button>
                        ))}
                    </div>
                </div>

                {filteredRegs.length === 0 ? (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No participants found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    {['Name', 'Email', 'Contact', 'College', 'Type', 'Reg Date', 'Payment', 'Team', 'Attendance'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '0.6rem', color: 'var(--text-dim)', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRegs.map(p => {
                                    const attended = attendanceIds.includes(p._id);
                                    const fee = event.registrationFee || 0;
                                    return (
                                        <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.5rem' }}>{`${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || 'N/A'}</td>
                                            <td style={{ padding: '0.5rem', color: 'var(--text-dim)' }}>{p.email}</td>
                                            <td style={{ padding: '0.5rem', color: 'var(--text-dim)' }}>{p.contactNumber || '—'}</td>
                                            <td style={{ padding: '0.5rem', color: 'var(--text-dim)' }}>{p.collegeName || '—'}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '700', color: p.participantType === 'iiit' ? 'var(--neon-cyan)' : 'var(--neon-magenta)' }}>{p.participantType || '—'}</span>
                                            </td>
                                            <td style={{ padding: '0.5rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                {fee > 0 ? (
                                                    <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--neon-cyan)' }}>₹{fee} Paid</span>
                                                ) : (
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Free</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.5rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>—</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                {attended ? (
                                                    <span style={{ color: 'var(--neon-cyan)', fontWeight: '700', fontSize: '0.8rem' }}>✓ Present</span>
                                                ) : (
                                                    <button onClick={() => markAttendance(p._id)} style={{
                                                        background: 'transparent', border: '1px solid var(--neon-cyan)',
                                                        color: 'var(--neon-cyan)', padding: '0.2rem 0.5rem', borderRadius: '8px',
                                                        cursor: 'pointer', fontSize: '0.72rem',
                                                    }}>Mark</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetailPage;
