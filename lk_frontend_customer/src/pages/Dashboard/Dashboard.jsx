import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        fetchRecentActivities();
    }, []);

    const fetchRecentActivities = async () => {
        try {
            // Simulated API call - replace with actual endpoint
            // const response = await fetch('/api/activities');
            // const data = await response.json();
            
            // Mock data
            const mockActivities = [
                {
                    id: 1,
                    type: 'appointment',
                    title: 'Plumbing Service Scheduled',
                    date: new Date(2025, 7, 1)
                },
                {
                    id: 2,
                    type: 'service',
                    title: 'Viewed Electrical Services',
                    date: new Date(2025, 7, 1)
                },
                {
                    id: 3,
                    type: 'tender',
                    title: 'New Tender Response Received',
                    date: new Date(2025, 6, 31)
                }
            ];
            
            setRecentActivities(mockActivities);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'appointment':
                return 'fas fa-calendar-check';
            case 'service':
                return 'fas fa-tools';
            case 'tender':
                return 'fas fa-file-contract';
            default:
                return 'fas fa-bell';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Welcome back, {user?.firstName || 'Customer'}!</h1>
            </div>

            <div className="dashboard-grid">
                <Link to="/customer/services" className="dashboard-card">
                    <i className="fas fa-tools"></i>
                    <h3>Browse Services</h3>
                    <p>Find and book professional services in your area</p>
                </Link>

                <Link to="/customer/appointments" className="dashboard-card">
                    <i className="fas fa-calendar-alt"></i>
                    <h3>My Appointments</h3>
                    <p>View and manage your service appointments</p>
                </Link>

                <Link to="/customer/tenders" className="dashboard-card">
                    <i className="fas fa-file-contract"></i>
                    <h3>Tender Requests</h3>
                    <p>Create and track tender requests</p>
                </Link>

                <Link to="/customer/profile" className="dashboard-card">
                    <i className="fas fa-user-circle"></i>
                    <h3>My Profile</h3>
                    <p>Update your personal information</p>
                </Link>
            </div>

            <div className="recent-activity">
                <h2>Recent Activity</h2>
                <ul className="activity-list">
                    {recentActivities.map(activity => (
                        <li key={activity.id} className="activity-item">
                            <div className="activity-icon">
                                <i className={getActivityIcon(activity.type)}></i>
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">{activity.title}</div>
                                <div className="activity-date">
                                    {activity.date.toLocaleDateString()}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
