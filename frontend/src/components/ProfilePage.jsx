import React, { useContext, useState, useEffect } from 'react';
import { NeonCard, NeonButton, NeonInput } from './ui/NeonComponents';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GENRE_OPTIONS = ['tech', 'cultural', 'sports', 'academic', 'social'];

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [organizers, setOrganizers] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', contactNumber: '', collegeName: '',
        genres: [], password: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                contactNumber: user.contactNumber || '',
                collegeName: user.collegeName || '',
                genres: user.genres || [],
                password: '',
            });
        }
        fetchOrganizers();
    }, [user]);

    const fetchOrganizers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/auth/organizers', { headers: { Authorization: `Bearer ${token}` } });
            setOrganizers(res.data);
        } catch (err) { console.error(err); }
    };

    const toggleGenre = (g) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.includes(g) ? prev.genres.filter(x => x !== g) : [...prev.genres, g],
        }));
    };

    const handleFollow = async (orgId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/auth/follow/${orgId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setUser(prev => ({ ...prev, followedOrganizers: res.data.followedOrganizers }));
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData };
            if (!payload.password) delete payload.password;
            const res = await axios.put('http://localhost:5000/api/auth/profile', payload, { headers: { Authorization: `Bearer ${token}` } });
            alert('Profile updated!');
            setUser({ ...user, ...res.data });
            navigate('/dashboard');
        } catch (err) { alert(err.response?.data?.message || 'Update failed'); }
    };

    if (!user) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Loading...</div>;

    const isFollowing = (orgId) => user?.followedOrganizers?.includes(orgId);

    return (
        <div style={{ padding: '2rem', maxWidth: '650px', margin: '0 auto' }}>
            <NeonCard title="Edit Profile">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    {/* Non-Editable Fields */}
                    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0 0 0.5rem 0', fontWeight: '600' }}>Non-Editable</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Email</span>
                                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{user.email}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Participant Type</span>
                                <span style={{ fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', color: user.participantType === 'iiit' ? 'var(--neon-cyan)' : 'var(--neon-magenta)' }}>{user.participantType === 'iiit' ? 'IIIT' : 'Non-IIIT'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Role</span>
                                <span style={{ fontWeight: '600', fontSize: '0.85rem', textTransform: 'capitalize' }}>{user.role}</span>
                            </div>
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>First Name</label>
                            <NeonInput value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="First Name" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Last Name</label>
                            <NeonInput value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="Last Name" />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Contact Number</label>
                        <NeonInput value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} placeholder="Contact Number" />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>College / Organization</label>
                        <NeonInput value={formData.collegeName} onChange={e => setFormData({ ...formData, collegeName: e.target.value })} placeholder="College Name" />
                    </div>

                    {/* Interests */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600' }}>Interests</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
                            {GENRE_OPTIONS.map(g => (
                                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: formData.genres.includes(g) ? 'var(--neon-cyan)' : 'var(--text-dim)' }}>
                                    <input type="checkbox" checked={formData.genres.includes(g)} onChange={() => toggleGenre(g)} />
                                    <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: formData.genres.includes(g) ? '700' : '400' }}>{g}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Followed Clubs */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600' }}>Followed Clubs</label>
                        {organizers.length === 0 ? (
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No clubs available.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
                                {organizers.map(org => (
                                    <button key={org._id} onClick={() => handleFollow(org._id)} style={{
                                        padding: '0.3rem 0.7rem', borderRadius: '16px',
                                        border: `1px solid ${isFollowing(org._id) ? 'var(--neon-cyan)' : 'var(--border-color)'}`,
                                        background: isFollowing(org._id) ? 'var(--neon-cyan)' : 'transparent',
                                        color: isFollowing(org._id) ? '#000' : 'var(--text-color)',
                                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: isFollowing(org._id) ? '700' : '400',
                                        transition: 'all 0.2s',
                                    }}>{org.organizerName || 'Club'}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>New Password</label>
                        <NeonInput type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Leave blank to keep current" />
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

export default ProfilePage;
