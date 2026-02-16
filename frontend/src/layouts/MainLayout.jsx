import React, { useState, useContext } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user && (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-color)',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}
                        >
                            <span style={{ display: 'block', width: '24px', height: '2px', background: 'currentColor' }}></span>
                            <span style={{ display: 'block', width: '24px', height: '2px', background: 'currentColor' }}></span>
                            <span style={{ display: 'block', width: '24px', height: '2px', background: 'currentColor' }}></span>
                        </button>

                        {menuOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '150%',
                                left: 0,
                                background: 'var(--bg-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                minWidth: '200px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                zIndex: 1001
                            }}>
                                <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-color)', padding: '0.75rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>Dashboard</Link>
                                <Link to="/events" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-color)', padding: '0.75rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>Browse Events</Link>
                                <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-color)', padding: '0.75rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>Edit Profile</Link>
                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }}></div>
                                <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--neon-magenta)', textAlign: 'left', padding: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)', letterSpacing: '-1px' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <span style={{ color: 'var(--neon-cyan)' }}>NEON</span> MERN
                    </Link>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <button onClick={toggleTheme} className="neon-button secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                    {theme === 'neon-dark' ? '☀ Light' : '☾ Dark'}
                </button>

                {!user && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/login" className="neon-button" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Login</Link>
                        <Link to="/register" className="neon-button secondary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

const MainLayout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '2rem' }}>
                {children}
            </main>
            <footer style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-dim)' }}>
                &copy; {new Date().getFullYear()} Neon MERN System. Built with Sleek Modern Style.
            </footer>
        </div>
    );
};

export default MainLayout;
