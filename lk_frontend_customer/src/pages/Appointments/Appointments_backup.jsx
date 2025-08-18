import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Appointments.css';

const Appointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [physicalAppointments, setPhysicalAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('virtual');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const [virtualRes, physicalRes] = await Promise.all([
                servicesApi.getUserVirtualAppointments(),
                servicesApi.getUserPhysicalVisits()
            ]);
            console.log('Virtual appointments:', virtualRes.data);
            console.log('Physical visits:', physicalRes.data);
            setAppointments(virtualRes.data);
            setPhysicalAppointments(physicalRes.data);
        } catch (error) {
            console.error('Error loading appointments:', error);
            setError('Failed to load appointments');
            toast.error('Failed to load appointments: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleBookPhysicalVisit = (appointment) => {
        try {
            navigate(`/customer/appointments/${appointment.id}/book-visit`, {
                state: {
                    virtualAppointmentId: appointment.id,
                    service: appointment.service,
                    supervisor: appointment.supervisor
                }
            });
        } catch (error) {
            console.error('Navigation error:', error);
            toast.error('Failed to navigate to booking page');
        }
    };

    const handlePaymentConfirmation = async (visitId) => {
        try {
            const response = await servicesApi.confirmPhysicalVisitPayment(visitId);
            console.log('Payment confirmation response:', response);
            toast.success('Payment confirmed successfully!');
            loadAppointments(); // Reload appointments
        } catch (error) {
            console.error('Payment confirmation error:', error);
            if (error.response?.status === 404) {
                toast.error('Visit not found');
            } else if (error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else {
                toast.error('Failed to confirm payment. Please try again.');
            }
        }
    };

    const getStatusIcon = (status) => {
        const statusIcons = {
            'scheduled': 'fas fa-calendar-check',
            'completed': 'fas fa-check-circle',
            'cancelled': 'fas fa-times-circle',
            'payment_pending': 'fas fa-clock',
            'confirmed': 'fas fa-thumbs-up'
        };
        return statusIcons[status] || 'fas fa-question-circle';
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'scheduled': 'scheduled',
            'completed': 'completed',
            'cancelled': 'cancelled',
            'payment_pending': 'pending',
            'confirmed': 'confirmed'
        };
        return statusColors[status] || 'default';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFilteredAppointments = () => {
        const currentAppointments = activeTab === 'virtual' ? appointments : physicalAppointments;
        
        return currentAppointments.filter(appointment => {
            const matchesSearch = searchTerm === '' || 
                (appointment.service_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (appointment.supervisor_name || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    };

    const getAppointmentStats = () => {
        const currentAppointments = activeTab === 'virtual' ? appointments : physicalAppointments;
        
        const stats = {
            total: currentAppointments.length,
            scheduled: currentAppointments.filter(a => a.status === 'scheduled').length,
            completed: currentAppointments.filter(a => a.status === 'completed').length,
            pending: currentAppointments.filter(a => a.status === 'payment_pending').length,
        };
        
        return stats;
    };

    const filteredAppointments = getFilteredAppointments();
    const stats = getAppointmentStats();

    if (loading) {
        return (
            <div className="appointments-container">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="appointments-container">
                <div className="error-container">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Appointments</h3>
                    <p>{error}</p>
                    <button onClick={loadAppointments} className="retry-button">
                        <i className="fas fa-refresh"></i>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="appointments-container">
            <div className="appointments-header">
                <div className="header-content">
                    <h1>My Appointments</h1>
                    <p className="header-subtitle">
                        Manage your virtual consultations and physical visits • {stats.total} total appointments
                    </p>
                </div>
                <div className="header-actions">
                    <Link to="/customer/services" className="action-button primary">
                        <i className="fas fa-plus"></i>
                        Book Consultation
                    </Link>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="appointments-stats">
                <div className="stat-card">
                    <div className="stat-icon scheduled">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.scheduled}</h3>
                        <p>Scheduled</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon completed">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.completed}</h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pending">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.pending}</h3>
                        <p>Payment Pending</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon total">
                        <i className="fas fa-list"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.total}</h3>
                        <p>Total</p>
                    </div>
                </div>
            </div>

            <div className="appointments-controls">
                <div className="appointments-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'virtual' ? 'active' : ''}`}
                        onClick={() => setActiveTab('virtual')}
                    >
                        <i className="fas fa-video"></i>
                        Virtual Consultations ({appointments.length})
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'physical' ? 'active' : ''}`}
                        onClick={() => setActiveTab('physical')}
                    >
                        <i className="fas fa-home"></i>
                        Physical Visits ({physicalAppointments.length})
                    </button>
                </div>

                <div className="filter-controls">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search appointments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter"
                    >
                        <option value="all">All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="payment_pending">Payment Pending</option>
                        <option value="confirmed">Confirmed</option>
                    </select>
                </div>
            </div>

            {/* Appointments Grid */}
            <div className="appointments-content">
                {filteredAppointments.length === 0 ? (
                    <div className="no-appointments">
                        <i className={`fas ${activeTab === 'virtual' ? 'fa-video' : 'fa-home'}`}></i>
                        <h3>No {activeTab === 'virtual' ? 'Virtual Consultations' : 'Physical Visits'}</h3>
                        <p>
                            {searchTerm || statusFilter !== 'all' 
                                ? 'No appointments match your current filters.'
                                : `You haven't booked any ${activeTab} appointments yet.`
                            }
                        </p>
                        <div className="no-appointments-actions">
                            <Link to="/customer/services" className="action-button primary">
                                <i className="fas fa-plus"></i>
                                Book Your First Service
                            </Link>
                            {(searchTerm || statusFilter !== 'all') && (
                                <button 
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                    className="action-button secondary"
                                >
                                    <i className="fas fa-times"></i>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="appointments-grid">
                        {filteredAppointments.map((appointment) => (
                            <div key={`${activeTab}-${appointment.id}`} className="appointment-card">
                                <div className="appointment-header">
                                    <div className="appointment-type">
                                        <i className={`fas ${activeTab === 'virtual' ? 'fa-video' : 'fa-home'}`}></i>
                                        <span>{activeTab === 'virtual' ? 'Virtual' : 'Physical'}</span>
                                    </div>
                                    <div className={`status-badge ${getStatusColor(appointment.status)}`}>
                                        <i className={getStatusIcon(appointment.status)}></i>
                                        {appointment.status.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="appointment-info">
                                    <h3>{appointment.service_name || `Service ${appointment.service}` || 'Service'}</h3>
                                    
                                    <div className="info-row">
                                        <span className="label">Supervisor:</span>
                                        <span className="value">
                                            {appointment.supervisor_name || `Supervisor ${appointment.supervisor}` || 'Not assigned'}
                                        </span>
                                    </div>

                                    <div className="appointment-datetime">
                                        <div className="date-info">
                                            <i className="fas fa-calendar"></i>
                                            <span>
                                                {formatDate(activeTab === 'virtual' ? appointment.scheduled_time : appointment.scheduled_date)}
                                            </span>
                                        </div>
                                        <div className="time-info">
                                            <i className="fas fa-clock"></i>
                                            <span>
                                                {activeTab === 'virtual' 
                                                    ? formatTime(appointment.scheduled_time)
                                                    : appointment.scheduled_time
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {activeTab === 'physical' && appointment.visit_address && (
                                        <div className="info-row">
                                            <span className="label">Address:</span>
                                            <span className="value">{appointment.visit_address}</span>
                                        </div>
                                    )}

                                    {activeTab === 'physical' && appointment.estimated_duration_hours && (
                                        <div className="info-row">
                                            <span className="label">Duration:</span>
                                            <span className="value">{appointment.estimated_duration_hours} hours</span>
                                        </div>
                                    )}
                                </div>

                                <div className="appointment-actions">
                                    {activeTab === 'virtual' && appointment.meeting_link && (
                                        <a 
                                            href={appointment.meeting_link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="action-link primary"
                                        >
                                            <i className="fas fa-video"></i>
                                            Join Meeting
                                        </a>
                                    )}

                                    {activeTab === 'virtual' && appointment.status === 'completed' && (
                                        <button 
                                            className="action-link secondary"
                                            onClick={() => handleBookPhysicalVisit(appointment)}
                                        >
                                            <i className="fas fa-home"></i>
                                            Book Physical Visit
                                        </button>
                                    )}

                                    {activeTab === 'physical' && appointment.status === 'payment_pending' && (
                                        <button 
                                            className="action-link primary"
                                            onClick={() => handlePaymentConfirmation(appointment.id)}
                                        >
                                            <i className="fas fa-credit-card"></i>
                                            Pay ${appointment.visit_fee}
                                        </button>
                                    )}
                                </div>

                                {(appointment.notes || appointment.supervisor_notes) && (
                                    <div className="appointment-notes">
                                        <h5>Notes:</h5>
                                        <p>{appointment.notes || appointment.supervisor_notes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
