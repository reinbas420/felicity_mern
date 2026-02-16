import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { NeonCard, NeonInput, NeonButton } from './ui/NeonComponents';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const [role, setRole] = useState('participant');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend doesn't strictly need role for login (it infers from DB), but we can pass it if we want to enforce client-side checks or just for UI.
      // For now, we just authenticate.
      const data = await login(email, password);

      // Optional: Check if logged in user role matches selected role
      if (data.role !== role) {
        alert(`Warning: You logged in as ${data.role}, but selected ${role}. Redirecting to your actual dashboard.`);
      }

      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
      // setError(err.response?.data?.message || 'Login failed'); // Removed per user request
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <NeonCard title="Login" style={{ width: '100%', maxWidth: '400px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
            {['participant', 'organizer', 'admin'].map((r) => (
              <label key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: role === r ? 'var(--neon-cyan)' : 'var(--text-dim)' }}>
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ accentColor: 'var(--neon-cyan)', marginBottom: '0.5rem' }}
                />
                <span style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{r}</span>
              </label>
            ))}
          </div>

          <NeonInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <NeonInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <NeonButton type="submit" style={{ marginTop: '1rem' }}>Login</NeonButton>
        </form>
      </NeonCard>
    </div>
  );
};

export default Login;
