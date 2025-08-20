import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignOutAlt, FaChevronDown, FaChevronUp, FaUsers, FaList, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { profileApi } from '../../api/profile';
import { getImageUrl, getUserAvatarUrl } from '../../utils/imageUtils';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showFullProfile, setShowFullProfile] = useState(false);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        profile_data: {
            city: '',
            state: ''
        }
    });
    const [appointments, setAppointments] = useState([]);
    const [saving, setSaving] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        fetchProfileData();
        fetchAppointments();
    }, []);

    const fetchProfileData = async () => {
        try {
            const response = await profileApi.getProfile();
            if (response.data) {
                // Backend returns top-level fields and profile_data
                const { first_name, last_name, email, phone, address, profile_data, role } = response.data;
                let avatar = null;
                if (profile_data) {
                    if (role === 'CUSTOMER') avatar = getUserAvatarUrl(profile_data, 'customer');
                    if (role === 'CONTRACTOR') avatar = getUserAvatarUrl(profile_data, 'contractor');
                    if (role === 'SUPERVISOR') avatar = getUserAvatarUrl(profile_data, 'supervisor');
                }
                setProfile({
                    firstName: first_name || '',
                    lastName: last_name || '',
                    email: email || '',
                    city: profile_data?.city || '',
                    state: profile_data?.state || '',
                    phone: phone || '',
                    address: address || '',
                    avatar: avatar || null
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to view your profile');
            } else {
                toast.error('Failed to load profile data');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            // Fetch both virtual and physical appointments
            const [virtualRes, physicalRes] = await Promise.all([
                profileApi.getVirtualAppointments(),
                profileApi.getPhysicalVisits()
            ]);
            // Add a type field for display
            const virtuals = (virtualRes.data || []).map(a => ({ ...a, type: 'Virtual' }));
            const physicals = (physicalRes.data || []).map(a => ({ ...a, type: 'Physical' }));
            setAppointments([...virtuals, ...physicals]);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Failed to load appointments');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updateData = {
                user: {
                    first_name: profile.firstName,
                    last_name: profile.lastName
                },
                phone: profile.phone,
                address: profile.address
            };
            
            const response = await profileApi.updateProfile(updateData);
            if (response.data) {
                toast.success('Profile updated successfully');
                // Refresh the profile data
                await fetchProfileData();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.status === 400) {
                const errors = error.response.data;
                if (typeof errors === 'object') {
                    Object.entries(errors).forEach(([key, value]) => {
                        toast.error(`${key}: ${value}`);
                    });
                } else {
                    toast.error('Invalid data submitted');
                }
            } else if (error.response?.status === 401) {
                toast.error('Please login to update your profile');
            } else {
                toast.error('Failed to update profile');
            }
        } finally {
            setSaving(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'confirmed': return 'status-confirmed';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="profile-avatar"
                />
                <div className="profile-info">
                    <h1>{profile.firstName} {profile.lastName}</h1>
                    <p className="profile-email">{profile.email}</p>
                    <button 
                        onClick={() => setShowFullProfile(!showFullProfile)}
                        className="toggle-profile-button"
                    >
                        {showFullProfile ? <FaChevronUp /> : <FaChevronDown />}
                        {showFullProfile ? 'Hide Full Profile' : 'See Full Profile'}
                    </button>
                </div>
            </div>

            {/* Navigation Sections */}
            <div className="profile-navigation">
                <Link to="/customer/my-quick-jobs" className="nav-section">
                    <div className="nav-icon">
                        <FaList />
                    </div>
                    <div className="nav-content">
                        <h3>My Works</h3>
                        <p>View and manage your quick jobs and work progress</p>
                    </div>
                </Link>

                <Link to="/customer/appointments" className="nav-section">
                    <div className="nav-icon">
                        <FaCalendarAlt />
                    </div>
                    <div className="nav-content">
                        <h3>My Appointments</h3>
                        <p>View your scheduled appointments and consultations</p>
                    </div>
                </Link>
            </div>

            {/* Collapsible Profile Details */}
            {showFullProfile && (
                <div className="profile-sections">
                    <section className="profile-section">
                        <h2>Personal Information</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={profile.firstName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={profile.lastName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={profile.email}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={profile.city}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="state">State</label>
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    value={profile.state}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={profile.address}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="save-button"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </section>

                    <section className="profile-section">
                        <h2>Recent Appointments</h2>
                        {appointments.length > 0 ? (
                            <ul className="appointments-list">
                        {appointments.map(appointment => (
                            <li key={appointment.id} className="appointment-item">
                                <div className="appointment-header">
                                    <span className="appointment-title">
                                        {appointment.type} Appointment
                                    </span>
                                    <span className="appointment-date">
                                        {appointment.date ? new Date(appointment.date).toLocaleDateString() : ''}
                                    </span>
                                </div>
                                <div className="appointment-details">
                                    <p>Supervisor: {appointment.supervisor || appointment.supervisor_id}</p>
                                    <span className={`appointment-status ${getStatusClass(appointment.status)}`}>
                                        {appointment.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                            </ul>
                        ) : (
                            <p>No appointments found.</p>
                        )}
                    </section>
                </div>
            )}

            {/* Logout Button */}
            <div className="profile-actions">
                <button 
                    onClick={handleLogout} 
                    className="logout-button"
                >
                    <FaSignOutAlt />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;
