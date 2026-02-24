import React, { useContext, useState, useEffect } from 'react';
import { NeonCard, NeonButton, NeonInput } from './ui/NeonComponents';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api_config';

const OrganizerProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        organizerName: '', category: '', description: '', contactEmail: '', contactNumber: '',
    });
    const [resetPassword, setResetPassword] = useState('');
    const [resetReason, setResetReason] = useState('');
    const [resetMsg, setResetMsg] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                organizerName: user.organizerName || '',
                category: user.category || '',
                description: user.description || '',
                contactEmail: user.contactEmail || '',
                contactNumber: user.contactNumber || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/auth/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Profile updated!');
            setUser({ ...user, ...res.data });
            navigate('/dashboard');
        } catch (err) { alert(err.response?.data?.message || 'Update failed'); }
    };

    const handleRequestReset = async () => {
        if (!resetPassword || resetPassword.length < 6) { setResetMsg('Password must be at least 6 characters'); return; }
        if (!resetReason.trim()) { setResetMsg('Please provide a reason for the password change'); return; }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/auth/organizer/request-password-reset`,
                { newPassword: resetPassword, reason: resetReason.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResetMsg(res.data.message);
            setResetPassword('');
            setResetReason('');
        } catch (err) { setResetMsg(err.response?.data?.message || 'Request failed'); }
    };

    if (!user) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <NeonCard title="Organizer Profile">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    {/* Non-editable */}
                    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0 0 0.5rem 0', fontWeight: '600' }}>Non-Editable</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Login Email</span>
                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{user.email}</span>
                        </div>
                    </div>

                    {/* Editable */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Club / Organizer Name</label>
                        <NeonInput value={formData.organizerName} onChange={e => setFormData({ ...formData, organizerName: e.target.value })} placeholder="Organizer Name" />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Category</label>
                        <NeonInput value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Tech, Cultural, Sports" />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="About your club..."
                            style={{
                                width: '100%', minHeight: '80px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                                borderRadius: '12px', padding: '0.8rem', color: 'var(--text-color)', fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                            }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Contact Email</label>
                        <NeonInput value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} placeholder="Contact Email" />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Contact Number</label>
                        <NeonInput value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} placeholder="Contact Number" />
                    </div>

                    {/* Password Reset Request */}
                    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0 0 0.5rem 0', fontWeight: '600' }}>Password Change (Requires Admin Approval)</p>
                        {user.pendingPasswordReset ? (
                            <p style={{ color: '#f59e0b', fontSize: '0.85rem', margin: 0 }}>⏳ Password reset request pending admin approval...</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <NeonInput type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Enter new password" />
                                <textarea value={resetReason} onChange={e => setResetReason(e.target.value)} placeholder="Reason for password change (required)..."
                                    style={{
                                        width: '100%', minHeight: '60px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                                        borderRadius: '10px', padding: '0.6rem', color: 'var(--text-color)', fontSize: '0.82rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                                    }} />
                                <NeonButton onClick={handleRequestReset} style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem', alignSelf: 'flex-start' }}>Request Reset</NeonButton>
                            </div>
                        )}
                        {resetMsg && <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: resetMsg.includes('fail') || resetMsg.includes('must') ? 'var(--neon-magenta)' : 'var(--neon-cyan)' }}>{resetMsg}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <NeonButton onClick={handleSave}>Save Changes</NeonButton>
                        <NeonButton onClick={() => navigate('/dashboard')} style={{ borderColor: 'var(--neon-magenta)', color: 'var(--neon-magenta)' }}>Cancel</NeonButton>
                    </div>
                </div>
            </NeonCard>
        </div>
    );
};

export default OrganizerProfilePage;
