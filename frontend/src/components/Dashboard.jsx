import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import ParticipantDashboard from './dashboards/ParticipantDashboard';
import OrganizerDashboard from './dashboards/OrganizerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    const DashboardComponents = {
        participant: ParticipantDashboard,
        organizer: OrganizerDashboard,
        admin: AdminDashboard,
    };

    const RoleBasedDashboard = DashboardComponents[user.role] || (() => <div>Unknown Role</div>);

    return (
        <div>
            <h1 className="neon-text" style={{ marginBottom: '2rem' }}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </h1>
            <RoleBasedDashboard />
        </div>
    );
};

export default Dashboard;
