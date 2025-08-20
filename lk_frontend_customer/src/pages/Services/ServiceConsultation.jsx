import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getUserAvatarUrl } from '../../utils/imageUtils';
import './ServiceConsultation.css';

const ServiceConsultation = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [service, setService] = useState(null);
    const [supervisors, setSupervisors] = useState([]);
    const [selectedSupervisor, setSelectedSupervisor] = useState(location.state?.supervisor || null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log('ServiceConsultation mounted');
        console.log('ServiceId:', serviceId);
        console.log('Location state:', location.state);
        loadServiceAndSupervisors();
    }, [serviceId]);

    const loadServiceAndSupervisors = async () => {
        try {
            const [serviceRes, supervisorsRes] = await Promise.all([
                servicesApi.getServiceById(serviceId),
                servicesApi.getSupervisorsByService(serviceId)
            ]);
            setService(serviceRes.data);
            setSupervisors(supervisorsRes.data);
        } catch (error) {
            toast.error('Failed to load service information');
            navigate('/customer/services');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            toast.error('Please log in to book an appointment');
            navigate('/login');
            return;
        }

        if (!selectedSupervisor) {
            toast.error('Please select a supervisor');
            return;
        }

        if (!appointmentDate || !appointmentTime) {
            toast.error('Please select both date and time');
            return;
        }

        // Format date and time for UTC
        const scheduledDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
        // Ensure the date is valid
        if (isNaN(scheduledDateTime.getTime())) {
            toast.error('Invalid date or time selected');
            return;
        }

        setIsSubmitting(true);

        try {
            // Debug supervisor object
            console.log('Selected supervisor:', selectedSupervisor);
            console.log('Selected supervisor structure:', {
                id: selectedSupervisor?.id,
                supervisor: selectedSupervisor?.supervisor,
                supervisorId: selectedSupervisor?.supervisor?.id
            });
            
            // Extract the actual supervisor ID from the nested structure
            const supervisorId = selectedSupervisor?.supervisor?.id;
            if (!supervisorId || isNaN(parseInt(supervisorId))) {
                throw new Error('Invalid supervisor selection - no valid supervisor ID found');
            }

            const requestData = {
                service: parseInt(serviceId),
                supervisor: parseInt(supervisorId), // Use the nested supervisor ID
                scheduled_time: scheduledDateTime.toISOString(),
                duration_minutes: 30,
                notes: notes || ''
            };
            
            // Log the final request data
            console.log('Final request data:', requestData);
            console.log('Request data types:', {
                service: typeof requestData.service,
                supervisor: typeof requestData.supervisor,
                scheduled_time: typeof requestData.scheduled_time,
                duration_minutes: typeof requestData.duration_minutes,
                notes: typeof requestData.notes
            });

            console.log('Sending virtual appointment request:', requestData);

            const response = await servicesApi.bookVirtualAppointment(requestData);

            console.log('API Response:', response);

            if (response && response.status === 201) {
                toast.success('Virtual consultation booked successfully!');
                navigate('/customer/appointments');
            } else {
                throw new Error(response?.data?.message || 'Failed to book virtual consultation');
            }
        } catch (error) {
            console.error('Booking error:', error);
            console.error('Error details:', error.response?.data);
            toast.error(
                error.response?.data?.message || 
                error.message || 
                'Failed to book consultation. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!service) {
        return <div>Service not found</div>;
    }

    return (
        <div className="service-consultation">
            <div className="consultation-header">
                <h1>Book Consultation for {service.name}</h1>
                <p className="service-description">{service.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="consultation-form">
                <div className="form-group">
                    <label>Book Virtual Consultation</label>
                    <p className="consultation-info">
                        Start with a virtual consultation. After completion, you can schedule a physical visit if needed.
                    </p>
                </div>

                <div className="form-group">
                    <label htmlFor="supervisor">Select Supervisor</label>
                    <div className="supervisors-grid">
                        {supervisors.map(supervisor => {
                            console.log('Supervisor data:', supervisor);
                            return (
                                <div 
                                    key={supervisor.id}
                                    className={`supervisor-card ${selectedSupervisor?.id === supervisor.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        console.log('Selecting supervisor:', supervisor);
                                        setSelectedSupervisor(supervisor);
                                    }}
                                >
                                    <img 
                                        src={getUserAvatarUrl(supervisor.supervisor, 'supervisor')} 
                                        alt={`${supervisor.supervisor?.user?.first_name || 'Supervisor'} ${supervisor.supervisor?.user?.last_name || ''}`} 
                                    />
                                    <h3>
                                        Dr. {supervisor.supervisor?.user?.first_name} {supervisor.supervisor?.user?.last_name}
                                    </h3>
                                    
                                    <div className="supervisor-info">
                                        <div className="info-row">
                                            <span className="info-key">
                                                ⭐ Rating
                                            </span>
                                            <span className="info-value rating">
                                                {supervisor.supervisor?.rating ? `${supervisor.supervisor?.rating}/5` : 'New'}
                                            </span>
                                        </div>
                                        
                                        <div className="info-row">
                                            <span className="info-key">
                                                💰 Rate
                                            </span>
                                            <span className="info-value price">
                                                ${supervisor.hourly_rate || '50'}/hr
                                            </span>
                                        </div>
                                        
                                        {supervisor.specializations && (
                                            <div className="info-row specialization">
                                                <span className="info-key">
                                                    🔧 Specialization
                                                </span>
                                                <span className="info-value">
                                                    {supervisor.specializations}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="date">Preferred Date</label>
                    <input
                        type="date"
                        id="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="time">Preferred Time</label>
                    <input
                        type="time"
                        id="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Additional Notes</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Describe your requirements or any specific concerns..."
                        rows={4}
                    />
                </div>

                <div className="consultation-info">
                    <div className="info-box">
                        <i className="fas fa-info-circle"></i>
                        <p>Virtual consultations are conducted online. You'll receive a meeting link after booking confirmation. After completion, you can schedule a physical visit if needed.</p>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Booking...' : 'Book Virtual Consultation'}
                </button>
            </form>
        </div>
    );
};

export default ServiceConsultation;
