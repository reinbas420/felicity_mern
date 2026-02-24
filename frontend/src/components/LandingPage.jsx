import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FelicityLogo } from '../layouts/MainLayout';

const LandingPage = () => {
    const { user } = useContext(AuthContext);

    // Redirect if already logged in
    if (user) return <Navigate to="/dashboard" replace />;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            minHeight: '80vh', textAlign: 'center', padding: '2rem',
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '4rem', margin: '0 0 0.5rem 0', lineHeight: 1.1 }}>
                    WELCOME TO<br />
                    <span style={{
                        fontSize: '5rem',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #00f3ff, #9d00ff, #da00ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-2px',
                    }}>Felicity</span>
                    <span style={{ fontSize: '2.5rem', marginLeft: '0.5rem', color: 'var(--text-dim)' }}>2026</span>
                </h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                    IIIT Hyderabad's Annual Technical & Cultural Festival
                </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/login"><button className="neon-button" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>Login</button></Link>
                <Link to="/register"><button className="neon-button secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>Register</button></Link>
            </div>
        </div>
    );
};

export default LandingPage;
