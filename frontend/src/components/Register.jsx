import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { NeonCard, NeonInput, NeonButton } from './ui/NeonComponents';

const GENRE_OPTIONS = ['tech', 'cultural', 'sports', 'academic', 'social'];
const IIIT_DOMAINS = ['@students.iiit.ac.in', '@research.iiit.ac.in', '@iiit.ac.in'];

const Register = () => {
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [participantType, setParticipantType] = useState('external');
  const [collegeName, setCollegeName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [genres, setGenres] = useState([]);

  const toggleGenre = g => setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!firstName || !lastName || !email || !password) { setError('Fill all required fields'); return; }

    // IIIT email domain validation
    if (participantType === 'iiit') {
      const isValidDomain = IIIT_DOMAINS.some(d => email.toLowerCase().endsWith(d));
      if (!isValidDomain) {
        setError('IIIT participants must use @students.iiit.ac.in, @research.iiit.ac.in, or @iiit.ac.in email');
        return;
      }
    }

    // Contact number validation: must be exactly 10 digits
    if (contactNumber) {
      const digits = contactNumber.replace(/\D/g, '');
      if (digits.length !== 10) {
        setError('Contact number must be exactly 10 digits (e.g. 9876543210)');
        return;
      }
    }

    try {
      await register({
        email, password, role: 'participant',
        firstName, lastName, participantType, collegeName,
        contactNumber: contactNumber ? `+91${contactNumber.replace(/\D/g, '')}` : '',
        genres,
      });
      navigate('/clubs?welcome=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <NeonCard title="Register" style={{ width: '100%', maxWidth: '480px' }}>
        {error && <p style={{ color: 'var(--neon-magenta)', textAlign: 'center', margin: '0 0 1rem 0' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <NeonInput type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required />
          <NeonInput type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} required />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <NeonInput placeholder="First Name *" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ flex: 1 }} />
            <NeonInput placeholder="Last Name *" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ flex: 1 }} />
          </div>

          <div>
            <p style={{ marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600' }}>Participant Type:</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {[{ val: 'iiit', label: 'IIIT Student' }, { val: 'external', label: 'External' }].map(opt => (
                <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: participantType === opt.val ? 'var(--neon-cyan)' : 'var(--text-dim)' }}>
                  <input type="checkbox" checked={participantType === opt.val} onChange={() => setParticipantType(opt.val)} />
                  <span style={{ fontWeight: participantType === opt.val ? '700' : '400' }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <NeonInput placeholder="College / Org Name" value={collegeName} onChange={e => setCollegeName(e.target.value)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <span style={{ padding: '0.6rem 0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRight: 'none', borderRadius: '12px 0 0 12px', color: 'var(--text-dim)', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>+91</span>
            <NeonInput placeholder="10-digit number" value={contactNumber} onChange={e => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} style={{ borderRadius: '0 12px 12px 0', flex: 1 }} />
          </div>

          <div>
            <p style={{ marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600' }}>Interested Genres:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {GENRE_OPTIONS.map(g => (
                <label key={g} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer',
                  color: genres.includes(g) ? 'var(--neon-cyan)' : 'var(--text-dim)',
                }}>
                  <input type="checkbox" checked={genres.includes(g)} onChange={() => toggleGenre(g)} />
                  <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: genres.includes(g) ? '700' : '400' }}>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <NeonButton type="submit" style={{ marginTop: '0.5rem' }}>Register</NeonButton>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--neon-cyan)' }}>Login</Link>
          </p>
        </form>
      </NeonCard>
    </div>
  );
};

export default Register;
