import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { NeonCard, NeonInput, NeonButton } from './ui/NeonComponents';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [role, setRole] = useState('participant');

  React.useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      if (data.role !== role) {
        alert(`Note: You are logged in as ${data.role}. Redirecting to your dashboard.`);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <NeonCard title="Login" style={{ width: '100%', maxWidth: '400px' }}>
        {error && <p style={{ color: 'var(--neon-magenta)', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '0.5rem' }}>
            {['participant', 'organizer', 'admin'].map(r => (
              <label key={r} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                color: role === r ? 'var(--neon-cyan)' : 'var(--text-dim)',
              }}>
                <input type="checkbox" checked={role === r} onChange={() => setRole(r)}
                  style={{ accentColor: 'var(--neon-cyan)' }} />
                <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: role === r ? '700' : '400' }}>{r}</span>
              </label>
            ))}
          </div>

          <NeonInput type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <NeonInput type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <NeonButton type="submit" style={{ marginTop: '0.5rem' }}>Login</NeonButton>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--neon-magenta)' }}>Forgot Password?</Link>
            <span>Don't have an account? <Link to="/register" style={{ color: 'var(--neon-cyan)' }}>Register</Link></span>
          </div>
        </form>
      </NeonCard>
    </div>
  );
};

export default Login;
