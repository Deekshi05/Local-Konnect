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
            console.log('Attempting to book physical visit for appointment:', appointment);
            console.log('Appointment ID:', appointment.id);
            console.log('Service:', appointment.service);
            console.log('Supervisor:', appointment.supervisor);
            
            // Validate required data
            if (!appointment.id) {
                toast.error('Appointment ID is missing');
                return;
            }
            
            if (!appointment.service) {
                toast.error('Service information is missing from appointment');
                return;
            }
            
            if (!appointment.supervisor) {
                toast.error('Supervisor information is missing from appointment');
                return;
            }

            const navigationPath = `/customer/appointments/${appointment.id}/book-visit`;
            console.log('Navigating to:', navigationPath);
            
            navigate(navigationPath, {
                state: {
                    virtualAppointmentId: appointment.id,
                    service: appointment.service,
                    supervisor: appointment.supervisor
                }
            });
        } catch (error) {
            console.error('Navigation error:', error);
            toast.error('Failed to navigate to booking page: ' + error.message);
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

    // Temporary function to mark virtual appointment as completed for testing
    const handleMarkCompleted = async (appointmentId) => {
        try {
            console.log('Marking appointment as completed:', appointmentId);
            await servicesApi.markVirtualAppointmentCompleted(appointmentId, 'Marked as completed for physical visit booking');
            toast.success('Virtual appointment marked as completed');
            loadAppointments(); // Refresh the appointments list
        } catch (error) {
            console.error('Error marking appointment as completed:', error);
            toast.error('Failed to mark appointment as completed: ' + (error.response?.data?.message || error.message));
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

    // Check if a physical visit already exists for this virtual appointment
    const hasPhysicalVisit = (virtualAppointmentId) => {
        return physicalAppointments.some(visit => 
            visit.virtual_appointment === virtualAppointmentId || 
            visit.virtual_appointment_id === virtualAppointmentId
        );
    };

    // Check if tender assistance already exists for this virtual appointment
    const hasTenderAssistance = (virtualAppointmentId) => {
        // Check if the appointment has tender_assistance data
        const appointment = appointments.find(apt => apt.id === virtualAppointmentId);
        return appointment && appointment.tender_assistance;
    };

    const handleBookTender = (appointment) => {
        console.log('Navigating to create tender with appointment:', appointment);
        // Navigate to tender creation page
        navigate('/customer/tenders/create', { 
            state: { 
                appointmentId: appointment.id,
                serviceType: appointment.service_name || 'Service',
                customerId: appointment.customer
            } 
        });
    };

    const getFilteredAppointments = () => {
        const currentAppointments = activeTab === 'virtual' ? appointments : physicalAppointments;
        
        const filtered = currentAppointments.filter(appointment => {
            const matchesSearch = searchTerm === '' || 
                (appointment.service_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (appointment.supervisor_name || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        // Sort appointments: scheduled first, then by date
        return filtered.sort((a, b) => {
            // Put scheduled appointments first
            if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
            if (b.status === 'scheduled' && a.status !== 'scheduled') return 1;
            
            // Then sort by date
            const dateA = new Date(activeTab === 'virtual' ? a.scheduled_time : a.scheduled_date);
            const dateB = new Date(activeTab === 'virtual' ? b.scheduled_time : b.scheduled_date);
            return dateA - dateB;
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

                                    {/* Tender Assistance Display - Debug */}
                                    {activeTab === 'virtual' && (
                                        console.log('Appointment data for tender check:', {
                                            id: appointment.id,
                                            tender_assistance: appointment.tender_assistance,
                                            hasData: !!appointment.tender_assistance
                                        })
                                    )}
                                    
                                    {/* Test Tender Assistance Display for completed virtual appointments
                                    {activeTab === 'virtual' && appointment.status === 'completed' && (
                                        <div className="tender-assistance-section">
                                            <div className="tender-header">
                                                <i className="fas fa-file-contract"></i>
                                                <span className="tender-title">Tender Assistance</span>
                                                <span className="tender-status in_progress">
                                                    In Progress
                                                </span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Estimated Budget:</span>
                                                <span className="value">₹50,000</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Timeline:</span>
                                                <span className="value">15 days</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Instructions:</span>
                                                <span className="value">Detailed project requirements provided</span>
                                            </div>
                                        </div>
                                    )} */}
                                    
                                    {activeTab === 'virtual' && appointment.tender_assistance && (
                                        <div className="tender-assistance-section">
                                            <div className="tender-header">
                                                <i className="fas fa-file-contract"></i>
                                                <span className="tender-title">Tender Assistance</span>
                                                <span className={`tender-status ${appointment.tender_assistance.status}`}>
                                                    {appointment.tender_assistance.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {appointment.tender_assistance.estimated_budget && (
                                                <div className="info-row">
                                                    <span className="label">Estimated Budget:</span>
                                                    <span className="value">₹{appointment.tender_assistance.estimated_budget}</span>
                                                </div>
                                            )}
                                            {appointment.tender_assistance.project_timeline_days && (
                                                <div className="info-row">
                                                    <span className="label">Timeline:</span>
                                                    <span className="value">{appointment.tender_assistance.project_timeline_days} days</span>
                                                </div>
                                            )}
                                            {appointment.tender_assistance.special_instructions && (
                                                <div className="info-row">
                                                    <span className="label">Instructions:</span>
                                                    <span className="value">{appointment.tender_assistance.special_instructions}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

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

                                    {/* {activeTab === 'virtual' && appointment.status === 'scheduled' && (
                                        <button 
                                            className="action-link warning"
                                            onClick={() => handleMarkCompleted(appointment.id)}
                                            title="Mark this virtual appointment as completed to enable physical visit booking"
                                        >
                                            <i className="fas fa-check"></i>
                                            Mark as Completed
                                        </button>
                                    )} */}

                                    {activeTab === 'virtual' && appointment.status === 'completed' && !hasPhysicalVisit(appointment.id) && (
                                        <button 
                                            className="action-link secondary"
                                            onClick={() => handleBookPhysicalVisit(appointment)}
                                            title="Book Physical Visit"
                                        >
                                            <i className="fas fa-home"></i>
                                            Book Physical Visit
                                        </button>
                                    )}

                                    {activeTab === 'virtual' && appointment.status === 'completed' && !hasPhysicalVisit(appointment.id) && !hasTenderAssistance(appointment.id) && (
                                        <button 
                                            className="action-link info"
                                            onClick={() => handleBookTender(appointment)}
                                            title="Get Tender Assistance"
                                        >
                                            <i className="fas fa-file-contract"></i>
                                            Book Tender
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
