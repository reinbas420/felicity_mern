import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NeonCard, NeonInput, NeonButton } from './ui/NeonComponents';
import axios from 'axios';
import { API_URL } from '../api_config';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
            setMessage('OTP verified! Enter your new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally { setLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, newPassword });
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '2rem' }}>
            <NeonCard title="Reset Password" style={{ width: '100%', maxWidth: '420px' }}>
                {/* Step indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '30px', height: '4px', borderRadius: '2px',
                            background: step >= s ? 'var(--neon-cyan)' : 'var(--border-color)',
                            transition: 'background 0.3s',
                        }} />
                    ))}
                </div>

                {message && <p style={{ color: 'var(--neon-cyan)', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</p>}
                {error && <p style={{ color: 'var(--neon-magenta)', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

                {step === 1 && (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Enter your email to receive a 6-digit OTP.</p>
                        <NeonInput type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <NeonButton type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</NeonButton>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Enter the 6-digit OTP sent to <strong>{email}</strong></p>
                        <NeonInput placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.3rem' }} />
                        <NeonButton type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</NeonButton>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <NeonInput type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        <NeonButton type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</NeonButton>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
                    <Link to="/login" style={{ color: 'var(--neon-cyan)' }}>Back to Login</Link>
                </p>
            </NeonCard>
        </div>
    );
};

export default ForgotPassword;
