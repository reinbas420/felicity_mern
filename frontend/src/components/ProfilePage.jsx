import React, { useContext, useState, useEffect } from 'react';
import { NeonCard, NeonButton, NeonInput } from './ui/NeonComponents';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        isIIIT: false
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                password: '',
                isIIIT: user.isIIIT
            });
        }
    }, [user]);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            // Assuming the backend returns the updated user object
            const res = await axios.put('http://localhost:5000/api/auth/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Profile updated successfully');

            // Ideally update context, here we force reload or navigate back
            setUser({ ...user, ...res.data });
            navigate('/dashboard');

        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    if (!user) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <NeonCard title="Edit Profile" variant="pure-black">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Full Name</label>
                        <NeonInput
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Name"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>New Password</label>
                        <NeonInput
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Leave blank to keep current password"
                        />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-color)', padding: '0.5rem 0' }}>
                        <input
                            type="checkbox"
                            checked={formData.isIIIT}
                            onChange={(e) => setFormData({ ...formData, isIIIT: e.target.checked })}
                        />
                        <span>I am an IIIT Student</span>
                    </label>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <NeonButton onClick={handleSave}>Save Changes</NeonButton>
                        <NeonButton secondary onClick={() => navigate('/dashboard')}>Cancel</NeonButton>
                    </div>
                </div>
            </NeonCard>
        </div>
    );
};

export default ProfilePage;
