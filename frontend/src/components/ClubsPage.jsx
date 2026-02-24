import React, { useState, useEffect, useContext } from 'react';
import { NeonCard, NeonButton } from './ui/NeonComponents';
import AuthContext from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api_config';

const ClubsPage = () => {
    const { user, setUser } = useContext(AuthContext);
    const [organizers, setOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const isWelcome = searchParams.get('welcome') === 'true';

    useEffect(() => { fetchOrganizers(); }, []);

    const fetchOrganizers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/auth/organizers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrganizers(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleFollow = async (orgId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/auth/follow/${orgId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(prev => ({ ...prev, followedOrganizers: res.data.followedOrganizers }));
        } catch (error) { alert(error.response?.data?.message || 'Error'); }
    };

    const isFollowing = (orgId) => user?.followedOrganizers?.includes(orgId);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading clubs...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>
                <span style={{ background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Clubs & Organizers</span>
            </h2>

            {isWelcome && (
                <div style={{
                    padding: '1.2rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(0,243,255,0.1), rgba(218,0,255,0.1))',
                    border: '1px solid rgba(0,243,255,0.3)',
                }}>
                    <h3 style={{ margin: '0 0 0.3rem 0', color: 'var(--neon-cyan)' }}>🎉 Welcome to Felicity 2026!</h3>
                    <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.88rem' }}>
                        Follow the clubs you're interested in to see their events on your dashboard. You can always come back here to discover more!
                    </p>
                </div>
            )}

            {organizers.length === 0 ? (
                <p style={{ color: 'var(--text-dim)' }}>No clubs/organizers registered yet.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                    {organizers.map(org => (
                        <NeonCard key={org._id} title={org.organizerName || 'Unknown Club'}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {org.category && (
                                    <span style={{
                                        display: 'inline-block', padding: '0.2rem 0.7rem', borderRadius: '12px',
                                        fontSize: '0.75rem', background: 'rgba(0,243,255,0.1)', color: 'var(--neon-cyan)',
                                        border: '1px solid rgba(0,243,255,0.3)', alignSelf: 'flex-start', textTransform: 'capitalize',
                                    }}>{org.category}</span>
                                )}
                                {org.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>{org.description?.substring(0, 80)}{org.description?.length > 80 ? '...' : ''}</p>}

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                                    <Link to={`/clubs/${org._id}`} style={{ textDecoration: 'none' }}>
                                        <NeonButton style={{ fontSize: '0.78rem', padding: '0.3rem 0.8rem' }}>View Details</NeonButton>
                                    </Link>
                                    <NeonButton
                                        onClick={() => handleFollow(org._id)}
                                        style={{
                                            fontSize: '0.78rem', padding: '0.3rem 0.8rem',
                                            ...(isFollowing(org._id) ? { background: 'var(--neon-magenta)', color: '#fff', borderColor: 'var(--neon-magenta)' } : {}),
                                        }}>
                                        {isFollowing(org._id) ? 'Unfollow' : 'Follow'}
                                    </NeonButton>
                                </div>
                            </div>
                        </NeonCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClubsPage;
