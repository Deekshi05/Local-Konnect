
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getServiceImageUrl, getUserAvatarUrl } from '../../utils/imageUtils';
import './ServiceDetail.css';

// Valid time slots from 9 AM to 5 PM
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor((i + 18) / 2); // Start from 9 (18/2)
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const ServiceDetail = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [supervisors, setSupervisors] = useState([]);
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    const { user } = useAuth();
    useEffect(() => {
        loadServiceDetails();
    }, [serviceId]);

    const loadServiceDetails = async () => {
        console.log('Loading service details for ID:', serviceId);
        try {
            // First, load the service details
            const serviceRes = await servicesApi.getServiceById(serviceId);
            console.log('Service data:', serviceRes.data);
            
            if (!serviceRes.data) {
                throw new Error('Service not found');
            }
            setService(serviceRes.data);

            // Then, load the supervisors
            try {
                const supervisorsRes = await servicesApi.getSupervisorsByService(serviceId);
                console.log('Supervisors data:', supervisorsRes.data);
                setSupervisors(supervisorsRes.data || []);
            } catch (supervisorError) {
                console.error('Error loading supervisors:', supervisorError);
                toast.error('Failed to load supervisors. Please try again.');
                setSupervisors([]);
            }
            
        } catch (error) {
            console.error('Error loading service details:', error);
            toast.error('Failed to load service details');
            navigate('/customer/services');
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        if (!selectedSupervisor || !appointmentDate || !appointmentTime || !user) {
            toast.error('Please fill in all required fields and ensure you are logged in');
            return;
        }

        setBooking(true);
        try {
            const scheduledTime = `${appointmentDate}T${appointmentTime}:00Z`; // Use UTC
            const response = await servicesApi.bookVirtualAppointment({
                customer: user.id,
                supervisor: selectedSupervisor.id,
                service: parseInt(serviceId),
                scheduled_time: scheduledTime,
                duration: 30, // default duration in minutes
                status: 'SCHEDULED'
            });

            toast.success('Virtual appointment booked successfully!');
            navigate('/customer/appointments');
        } catch (error) {
            console.error('Booking error:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to book an appointment');
                navigate('/login');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to book appointment. Please try again.');
            }
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!service) {
        return (
            <div className="error-container">
                <h2>Service not found</h2>
                <button onClick={() => navigate('/customer/services')} className="back-button">
                    Back to Services
                </button>
            </div>
        );
    }

    return (
        <div className="service-detail-container">
            <div className="service-detail-header">
                {service?.image && (
                    <img src={getServiceImageUrl(service)} alt={service.name} className="service-detail-image" />
                )}
                <h1>{service?.name}</h1>
                <p>{service?.description}</p>
            </div>

            {supervisors.length > 0 ? (
                <div className="booking-section">
                    <h2>Book a Virtual Consultation</h2>
                    <div className="supervisors-grid">
                        {supervisors.map((supervisor) => (
                            <div 
                                key={supervisor.id}
                                className="supervisor-card"
                            >
                                <img 
                                    src={getUserAvatarUrl(supervisor.supervisor, 'supervisor')} 
                                    alt={supervisor.supervisor?.user?.first_name || 'Supervisor'} 
                                />
                                <h3>
                                    {supervisor.supervisor?.user?.first_name} {supervisor.supervisor?.user?.last_name}
                                </h3>
                                <p>Rating: {supervisor.supervisor?.rating || 'N/A'}</p>
                                <p>Hourly Rate: ${supervisor.hourly_rate}</p>
                                <p>Visit Fee: ${supervisor.physical_visit_fee}</p>
                                <button 
                                    className="book-button"
                                    onClick={() => {
                                        console.log('Navigating to:', `/customer/services/${serviceId}/book`);
                                        console.log('With supervisor:', supervisor);
                                        navigate(`/customer/services/${serviceId}/book`, {
                                            state: { supervisor }
                                        });
                                    }}
                                >
                                    Book Consultation
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="no-supervisors">No supervisors available for this service.</div>
            )}
        </div>
    );
};

export default ServiceDetail;
