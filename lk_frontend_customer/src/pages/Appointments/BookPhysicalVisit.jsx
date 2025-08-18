import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './BookPhysicalVisit.css';

const BookPhysicalVisit = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [virtualAppointment, setVirtualAppointment] = useState(null);
    const [visitAddress, setVisitAddress] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [estimatedDurationHours, setEstimatedDurationHours] = useState(2);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadVirtualAppointment();
    }, [appointmentId]);

    const loadVirtualAppointment = async () => {
        try {
            // Get virtual appointment details
            const appointments = await servicesApi.getUserVirtualAppointments();
            const appointment = appointments.data.find(app => app.id === parseInt(appointmentId));
            
            if (!appointment) {
                toast.error('Virtual appointment not found');
                navigate('/customer/appointments');
                return;
            }

            if (appointment.status !== 'completed') {
                toast.error('Physical visits can only be booked after completing the virtual consultation');
                navigate('/customer/appointments');
                return;
            }

            setVirtualAppointment(appointment);
        } catch (error) {
            console.error('Error loading virtual appointment:', error);
            toast.error('Failed to load appointment details');
            navigate('/customer/appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!visitAddress.trim()) {
            toast.error('Please enter your address');
            return;
        }

        if (!scheduledDate || !scheduledTime) {
            toast.error('Please select date and time');
            return;
        }

        setIsSubmitting(true);

        try {
            const requestData = {
                virtual_appointment: parseInt(appointmentId),
                visit_address: visitAddress.trim(),
                scheduled_date: scheduledDate,
                scheduled_time: scheduledTime,
                estimated_duration_hours: estimatedDurationHours
            };

            console.log('Booking physical visit:', requestData);
            
            const response = await servicesApi.bookPhysicalVisit(requestData);

            if (response && response.status === 201) {
                toast.success('Physical visit scheduled successfully!');
                navigate('/customer/appointments');
            } else {
                throw new Error(response?.data?.message || 'Failed to schedule physical visit');
            }
        } catch (error) {
            console.error('Booking error:', error);
            toast.error(
                error.response?.data?.message || 
                error.message || 
                'Failed to schedule physical visit. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner message="Loading appointment details..." />;

    if (!virtualAppointment) {
        return (
            <div className="book-visit-container">
                <div className="error-message">
                    <h2>Appointment not found</h2>
                    <p>The requested virtual appointment could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="book-visit-container">
            <div className="book-visit-header">
                <button 
                    className="back-button"
                    onClick={() => navigate('/customer/appointments')}
                >
                    <i className="fas fa-arrow-left"></i>
                    Back to Appointments
                </button>
                <h1>Schedule Physical Visit</h1>
                <p>Book a physical visit after your completed virtual consultation</p>
            </div>

            <div className="appointment-summary">
                <h3>Based on Virtual Consultation</h3>
                <div className="summary-details">
                    <div className="detail-item">
                        <span className="label">Service:</span>
                        <span className="value">{virtualAppointment.service_name}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Supervisor:</span>
                        <span className="value">{virtualAppointment.supervisor_name}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Virtual Consultation Date:</span>
                        <span className="value">
                            {new Date(virtualAppointment.scheduled_time).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="book-visit-form">
                <div className="form-group">
                    <label htmlFor="visitAddress">Visit Address *</label>
                    <textarea
                        id="visitAddress"
                        value={visitAddress}
                        onChange={(e) => setVisitAddress(e.target.value)}
                        placeholder="Enter your complete address where the physical visit should take place..."
                        rows={3}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="scheduledDate">Preferred Date *</label>
                        <input
                            type="date"
                            id="scheduledDate"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="scheduledTime">Preferred Time *</label>
                        <input
                            type="time"
                            id="scheduledTime"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="duration">Estimated Duration</label>
                    <select
                        id="duration"
                        value={estimatedDurationHours}
                        onChange={(e) => setEstimatedDurationHours(parseInt(e.target.value))}
                    >
                        <option value={1}>1 hour</option>
                        <option value={2}>2 hours</option>
                        <option value={3}>3 hours</option>
                        <option value={4}>4 hours</option>
                        <option value={6}>6 hours</option>
                        <option value={8}>Full day (8 hours)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Additional Notes</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any specific requirements or additional information..."
                        rows={3}
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate('/customer/appointments')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Scheduling...' : 'Schedule Physical Visit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookPhysicalVisit;
