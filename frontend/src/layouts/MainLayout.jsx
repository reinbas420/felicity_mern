import React, { useState, useContext } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const FelicityLogo = ({ size = '1.5rem' }) => (
    <span style={{
        fontSize: size, fontWeight: '900', letterSpacing: '-1px',
        background: 'linear-gradient(135deg, #00f3ff, #da00ff)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', fontFamily: "'Inter', sans-serif", textShadow: 'none',
    }}>Felicity</span>
);

/* ─── SVG outline icons ─── */
const svgProps = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

const Icons = {
    home: (
        <svg {...svgProps}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    search: (
        <svg {...svgProps}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    ),
    building: (
        <svg {...svgProps}><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="6" x2="9" y2="6.01" /><line x1="15" y1="6" x2="15" y2="6.01" /><line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" /><line x1="9" y1="14" x2="9" y2="14.01" /><line x1="15" y1="14" x2="15" y2="14.01" /><line x1="9" y1="18" x2="15" y2="18" /></svg>
    ),
    user: (
        <svg {...svgProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    ),
    edit: (
        <svg {...svgProps}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
    ),
    sun: (
        <svg {...svgProps}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
    ),
    moon: (
        <svg {...svgProps}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
    ),
    logout: (
        <svg {...svgProps}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
    ),
    chevronLeft: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
    ),
    chevronRight: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
    ),
};

/* ─── icon wrapper ─── */
const IconWrap = ({ children }) => (
    <span style={{ width: '24px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{children}</span>
);

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { logout(); navigate('/login'); };

    /* ─── role-based sections ─── */
    const getSections = () => {
        if (!user) return [];

        if (user.role === 'admin') return [
            {
                header: 'NAVIGATION', items: [
                    { to: '/dashboard', label: 'Dashboard', icon: Icons.home },
                    { to: '/events', label: 'Browse Events', icon: Icons.search },
                    { to: '/clubs', label: 'Clubs / Organizers', icon: Icons.building },
                ]
            },
        ];

        if (user.role === 'organizer') return [
            {
                header: 'NAVIGATION', items: [
                    { to: '/dashboard', label: 'Dashboard', icon: Icons.home },
                    { to: '/organizer/profile', label: 'Profile', icon: Icons.user },
                ]
            },
        ];

        // participant
        return [
            {
                header: 'NAVIGATION', items: [
                    { to: '/dashboard', label: 'Dashboard', icon: Icons.home },
                    { to: '/events', label: 'Browse Events', icon: Icons.search },
                    { to: '/clubs', label: 'Clubs / Organizers', icon: Icons.building },
                ]
            },
            {
                header: 'MORE', items: [
                    { to: '/profile', label: 'Edit Profile', icon: Icons.edit },
                ]
            },
        ];
    };

    const sections = getSections();
    const sidebarWidth = collapsed ? 60 : 240;

    if (!user) return null;

    return (
        <aside style={{
            width: sidebarWidth,
            minHeight: '100vh',
            background: '#0d0d0d',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            zIndex: 1100,
            overflow: 'hidden',
        }}>
            {/* ─── Logo ─── */}
            <div style={{
                padding: collapsed ? '1.2rem 0' : '1.2rem 1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.4rem', background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦</span>
                    {!collapsed && <FelicityLogo size="1.3rem" />}
                </Link>
            </div>

            {/* ─── Nav sections ─── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
                {sections.map((section, si) => (
                    <div key={si} style={{ marginBottom: '0.5rem' }}>
                        {!collapsed && (
                            <div style={{
                                padding: '0.6rem 1.2rem 0.3rem',
                                fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1.5px',
                                color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                            }}>{section.header}</div>
                        )}
                        {section.items.map(item => {
                            const active = location.pathname === item.to;
                            return (
                                <Link key={item.to} to={item.to} title={collapsed ? item.label : undefined}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: collapsed ? '0.65rem 0' : '0.65rem 1.2rem',
                                        margin: collapsed ? '2px 6px' : '2px 8px',
                                        borderRadius: '10px', textDecoration: 'none',
                                        color: active ? '#00f3ff' : 'rgba(255,255,255,0.6)',
                                        background: active ? 'rgba(0,243,255,0.08)' : 'transparent',
                                        fontSize: '0.88rem', fontWeight: active ? '600' : '400',
                                        transition: 'all 0.2s ease',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <IconWrap>{item.icon}</IconWrap>
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* ─── Bottom area ─── */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: collapsed ? '0.8rem 0' : '0.8rem 1rem',
                display: 'flex', flexDirection: 'column', gap: '0.4rem',
            }}>
                {/* Theme toggle */}
                <button onClick={toggleTheme} style={{
                    background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
                    padding: collapsed ? '0.5rem 0' : '0.5rem 0.4rem',
                    borderRadius: '10px', fontSize: '0.85rem', width: '100%',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'background 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <IconWrap>{theme === 'neon-dark' ? Icons.sun : Icons.moon}</IconWrap>
                    {!collapsed && <span>{theme === 'neon-dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {/* Logout */}
                <button onClick={handleLogout} style={{
                    background: 'transparent', border: 'none', color: '#ff4d6a',
                    display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
                    padding: collapsed ? '0.5rem 0' : '0.5rem 0.4rem',
                    borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', width: '100%',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'background 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,106,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <IconWrap>{Icons.logout}</IconWrap>
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>

            {/* ─── Collapse toggle ─── */}
            <button onClick={() => setCollapsed(!collapsed)} style={{
                position: 'absolute', top: '50%', right: '-14px', transform: 'translateY(-50%)',
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#1a1a1a', border: '1px solid rgba(0,243,255,0.25)',
                color: 'rgba(0,243,255,0.7)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', zIndex: 1200,
                transition: 'all 0.2s',
                boxShadow: '0 0 8px rgba(0,243,255,0.1)',
            }}
                onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = 'rgba(0,243,255,0.5)'; e.currentTarget.style.color = '#00f3ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = 'rgba(0,243,255,0.25)'; e.currentTarget.style.color = 'rgba(0,243,255,0.7)'; }}
            >
                {collapsed ? Icons.chevronRight : Icons.chevronLeft}
            </button>
        </aside>
    );
};

/* ─── Top bar for logged-out users ─── */
const TopBar = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <nav style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.8rem 2rem', borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)', backdropFilter: 'blur(10px)',
            position: 'sticky', top: 0, zIndex: 1000,
        }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <FelicityLogo size="1.5rem" />
            </Link>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <button onClick={toggleTheme} className="neon-button secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    {theme === 'neon-dark' ? '☀ Light' : '☾ Dark'}
                </button>
                <Link to="/login" className="neon-button" style={{ textDecoration: 'none', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Login</Link>
                <Link to="/register" className="neon-button secondary" style={{ textDecoration: 'none', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Register</Link>
            </div>
        </nav>
    );
};

const MainLayout = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [collapsed, setCollapsed] = useState(false);

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
                <TopBar />
                <main style={{ flex: 1, padding: '0', width: '100%' }}>{children}</main>
                <footer style={{ textAlign: 'center', padding: '0.8rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    &copy; {new Date().getFullYear()} Felicity 2026 — IIIT Hyderabad
                </footer>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', width: '100vw', display: 'flex' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                marginLeft: collapsed ? '60px' : '240px',
                transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1)',
                minHeight: '100vh',
            }}>
                <main style={{ flex: 1, padding: '0', width: '100%' }}>{children}</main>
                <footer style={{ textAlign: 'center', padding: '0.8rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    &copy; {new Date().getFullYear()} Felicity 2026 — IIIT Hyderabad
                </footer>
            </div>
        </div>
    );
};

export { FelicityLogo };
export default MainLayout;
