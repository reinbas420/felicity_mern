import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { NeonCard, NeonInput, NeonButton } from './ui/NeonComponents';

const GENRE_OPTIONS = ['tech', 'cultural', 'sports', 'academic', 'social'];

const Register = () => {
  const [role, setRole] = useState('participant');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Common
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Participant fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [participantType, setParticipantType] = useState('external');
  const [collegeName, setCollegeName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [genres, setGenres] = useState([]);

  // Organizer fields  
  const [organizerName, setOrganizerName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const toggleGenre = (g) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'participant') {
      if (!firstName || !lastName || !email || !password) {
        setError('Please fill all required fields');
        return;
      }
      if (participantType === 'iiit') {
        const iiitRegex = /^[a-zA-Z0-9._%+-]+@(students\.iiit\.ac\.in|research\.iiit\.ac\.in|iiit\.ac\.in)$/;
        if (!iiitRegex.test(email)) {
          setError('IIIT students must use a valid IIIT email');
          return;
        }
      }
    } else {
      if (!organizerName || !email || !password || !category) {
        setError('Please fill all required fields');
        return;
      }
    }

    try {
      const payload = { email, password, role };

      if (role === 'participant') {
        Object.assign(payload, { firstName, lastName, participantType, collegeName, contactNumber, genres });
      } else {
        Object.assign(payload, { organizerName, category, description, contactEmail: contactEmail || email });
      }

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const inputStyle = { marginBottom: 0 };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <NeonCard title="Register" style={{ width: '100%', maxWidth: '500px' }}>
        {error && <p style={{ color: 'var(--neon-magenta)', textAlign: 'center', margin: '0 0 1rem 0' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Role Toggle */}
          <div style={{
            display: 'flex',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            marginBottom: '0.5rem'
          }}>
            {['participant', 'organizer'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  background: role === r ? 'var(--neon-cyan)' : 'transparent',
                  color: role === r ? '#000' : 'var(--text-color)',
                }}
              >
                {r === 'participant' ? '👤 User' : '🏢 Organizer'}
              </button>
            ))}
          </div>

          {/* Common Fields */}
          <NeonInput type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <NeonInput type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />

          {/* === PARTICIPANT FIELDS === */}
          {role === 'participant' && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <NeonInput placeholder="First Name *" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
                <NeonInput placeholder="Last Name *" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
              </div>

              <div>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Participant Type:</p>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {[{ val: 'iiit', label: 'IIIT Student' }, { val: 'external', label: 'External' }].map(opt => (
                    <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: participantType === opt.val ? 'var(--neon-cyan)' : 'var(--text-dim)' }}>
                      <input type="radio" name="ptype" value={opt.val} checked={participantType === opt.val} onChange={e => setParticipantType(e.target.value)} />
                      <span style={{ fontWeight: participantType === opt.val ? '700' : '400' }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <NeonInput placeholder="College / Org Name" value={collegeName} onChange={e => setCollegeName(e.target.value)} style={inputStyle} />
              <NeonInput placeholder="Contact Number" value={contactNumber} onChange={e => setContactNumber(e.target.value)} style={inputStyle} />

              {/* Genre Preferences */}
              <div>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Interested Genres:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {GENRE_OPTIONS.map(g => (
                    <button type="button" key={g} onClick={() => toggleGenre(g)} style={{
                      padding: '0.35rem 0.8rem', borderRadius: '18px',
                      border: `1px solid ${genres.includes(g) ? 'var(--neon-cyan)' : 'var(--border-color)'}`,
                      background: genres.includes(g) ? 'var(--neon-cyan)' : 'transparent',
                      color: genres.includes(g) ? '#000' : 'var(--text-color)',
                      cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.8rem',
                      fontWeight: genres.includes(g) ? '700' : '400', transition: 'all 0.2s',
                    }}>{g}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* === ORGANIZER FIELDS === */}
          {role === 'organizer' && (
            <>
              <NeonInput placeholder="Organizer Name *" value={organizerName} onChange={e => setOrganizerName(e.target.value)} required style={inputStyle} />
              <NeonInput placeholder="Category * (e.g. Tech Club, Sports)" value={category} onChange={e => setCategory(e.target.value)} required style={inputStyle} />
              <NeonInput placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
              <NeonInput placeholder="Contact Email (defaults to login email)" value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={inputStyle} />
            </>
          )}

          <NeonButton type="submit" style={{ marginTop: '0.5rem' }}>Register</NeonButton>
        </form>
      </NeonCard>
    </div>
  );
};

export default Register;
