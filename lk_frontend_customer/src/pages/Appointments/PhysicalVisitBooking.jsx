import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './PhysicalVisitBooking.css';

const PhysicalVisitBooking = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [formData, setFormData] = useState({
        visit_address: '',
        scheduled_date: '',
        scheduled_time: '',
        estimated_duration_hours: 2,
    });

    useEffect(() => {
        loadAppointmentDetails();
    }, [appointmentId]);

    const loadAppointmentDetails = async () => {
        if (!appointmentId) {
            console.error('No appointment ID provided');
            toast.error('No appointment ID provided');
            navigate('/customer/appointments');
            return;
        }

        try {
            setLoading(true);
            console.log('Loading appointment details for ID:', appointmentId);
            
            // Get virtual appointment details first
            const response = await servicesApi.getUserVirtualAppointments();
            console.log('Virtual appointments response:', response.data);
            
            const appointment = response.data.find(a => a.id === parseInt(appointmentId));
            console.log('Found appointment:', appointment);
            
            if (!appointment) {
                console.error('Virtual appointment not found for ID:', appointmentId);
                toast.error('Virtual appointment not found');
                navigate('/customer/appointments');
                return;
            }
            
            // Check for required fields with more detailed logging
            console.log('Appointment service:', appointment.service);
            console.log('Appointment supervisor:', appointment.supervisor);
            
            if (!appointment.service) {
                console.error('Missing service in appointment:', appointment);
                toast.error('Service information is missing from appointment');
                navigate('/customer/appointments');
                return;
            }
            
            if (!appointment.supervisor) {
                console.error('Missing supervisor in appointment:', appointment);
                toast.error('Supervisor information is missing from appointment');
                navigate('/customer/appointments');
                return;
            }
            
            // More specific validation for service and supervisor IDs
            const serviceId = appointment.service?.id || appointment.service;
            const supervisorId = appointment.supervisor?.id || appointment.supervisor;
            
            if (!serviceId || !supervisorId) {
                console.error('Invalid service or supervisor ID:', { serviceId, supervisorId });
                toast.error('Invalid appointment data: Missing service or supervisor ID');
                navigate('/customer/appointments');
                return;
            }
            
            console.log('Selected appointment:', appointment);
            setAppointment(appointment);
            
            // Pre-fill form data with defaults
            setFormData(prev => ({
                ...prev,
                service: serviceId,
                supervisor: supervisorId,
                estimated_duration_hours: 2
            }));
        } catch (error) {
            console.error('Error loading appointment:', error);
            toast.error('Failed to load appointment details: ' + (error.response?.data?.message || error.message));
            navigate('/customer/appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        const serviceId = appointment?.service?.id || appointment?.service;
        const supervisorId = appointment?.supervisor?.id || appointment?.supervisor;
        
        if (!serviceId || !supervisorId) {
            console.error('Missing service or supervisor ID:', { serviceId, supervisorId, appointment });
            toast.error('Invalid appointment data: Missing service or supervisor information');
            return;
        }

        if (!formData.visit_address.trim()) {
            toast.error('Please enter a visit address');
            return;
        }

        if (!formData.scheduled_date || !formData.scheduled_time) {
            toast.error('Please select both date and time');
            return;
        }

        setBooking(true);

        try {
            const bookingData = {
                virtual_appointment: parseInt(appointmentId),
                service: serviceId,
                supervisor: supervisorId,
                ...formData,
                visit_fee: appointment.supervisor?.physical_visit_fee || 0,
                status: 'payment_pending'
            };

            console.log('Submitting physical visit booking:', bookingData);

            const response = await servicesApi.bookPhysicalVisit(bookingData);
            
            if (response?.status === 201) {
                toast.success('Physical visit booked successfully! Payment pending.');
                navigate('/customer/appointments');
            } else {
                throw new Error(response?.data?.message || 'Failed to create physical visit booking');
            }
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Failed to book physical visit: ' + (error.response?.data?.message || error.message));
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!appointment) {
        return <div className="error-message">Appointment not found</div>;
    }

    return (
        <div className="physical-visit-booking-container">
            <h1>Book Physical Visit</h1>
            
            <div className="appointment-summary">
                <h2>Virtual Appointment Summary</h2>
                <p><strong>Service:</strong> {appointment?.service?.name || 'N/A'}</p>
                <p><strong>Supervisor:</strong> {appointment?.supervisor?.user 
                    ? `${appointment.supervisor.user.first_name || ''} ${appointment.supervisor.user.last_name || ''}`
                    : 'Not assigned'}</p>
                <p><strong>Virtual Consultation Date:</strong> {
                    appointment?.scheduled_time 
                        ? new Date(appointment.scheduled_time).toLocaleDateString() 
                        : 'Not scheduled'
                }</p>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                    <label>Visit Address:</label>
                    <textarea
                        name="visit_address"
                        value={formData.visit_address}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter the complete address for the physical visit"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Preferred Date:</label>
                        <input
                            type="date"
                            name="scheduled_date"
                            value={formData.scheduled_date}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Preferred Time:</label>
                        <input
                            type="time"
                            name="scheduled_time"
                            value={formData.scheduled_time}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Estimated Duration (hours):</label>
                    <select
                        name="estimated_duration_hours"
                        value={formData.estimated_duration_hours}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="1">1 hour</option>
                        <option value="2">2 hours</option>
                        <option value="3">3 hours</option>
                        <option value="4">4 hours</option>
                    </select>
                </div>

                <div className="fee-notice">
                    <p>Note: A visit fee will be required after booking confirmation. The supervisor will review your preferred time and may suggest alternatives if needed.</p>
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={booking}
                >
                    {booking ? 'Booking...' : 'Book Physical Visit'}
                </button>
            </form>
        </div>
    );
};

export default PhysicalVisitBooking;
