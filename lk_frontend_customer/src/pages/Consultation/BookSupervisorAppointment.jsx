import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { consultationApi } from '../../api/consultation';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './BookSupervisorAppointment.css';

const BookSupervisorAppointment = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [formData, setFormData] = useState({
        service: '',
        supervisor: '',
        scheduled_time: '',
        description: '',
        virtual_meeting_preference: 'zoom' // or 'teams' or 'meet'
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const response = await servicesApi.getAllServices();
            setServices(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load services');
            setLoading(false);
        }
    };

    const loadSupervisorsForService = async (serviceId) => {
        try {
            // Assuming there's an endpoint to get supervisors by service
            const response = await servicesApi.getSupervisorsByService(serviceId);
            setSupervisors(response.data);
        } catch (error) {
            toast.error('Failed to load supervisors');
        }
    };

    const handleServiceChange = (e) => {
        const serviceId = e.target.value;
        setFormData(prev => ({ ...prev, service: serviceId }));
        if (serviceId) {
            loadSupervisorsForService(serviceId);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create virtual appointment
            const appointmentData = {
                customer: user.id,
                supervisor: parseInt(formData.supervisor),
                service: parseInt(formData.service),
                scheduled_time: new Date(formData.scheduled_time).toISOString(),
                description: formData.description,
                meeting_preference: formData.virtual_meeting_preference
            };

            const response = await consultationApi.createVirtualAppointment(appointmentData);
            toast.success('Appointment booked successfully!');
            navigate('/appointments/virtual');
        } catch (error) {
            console.error('Error booking appointment:', error);
            toast.error(error.response?.data?.detail || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="book-supervisor">
            <h2>Book a Consultation with a Supervisor</h2>
            
            <form onSubmit={handleSubmit} className="consultation-form">
                <div className="form-group">
                    <label htmlFor="service">Service Category *</label>
                    <select
                        id="service"
                        value={formData.service}
                        onChange={handleServiceChange}
                        required
                    >
                        <option value="">Select a service</option>
                        {services.map(service => (
                            <option key={service.id} value={service.id}>
                                {service.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="supervisor">Supervisor *</label>
                    <select
                        id="supervisor"
                        value={formData.supervisor}
                        onChange={(e) => setFormData(prev => ({ ...prev, supervisor: e.target.value }))}
                        required
                    >
                        <option value="">Select a supervisor</option>
                        {supervisors.map(supervisor => (
                            <option key={supervisor.id} value={supervisor.id}>
                                {supervisor.user.first_name} {supervisor.user.last_name} - Rating: {supervisor.rating}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="scheduled_time">Preferred Time *</label>
                    <input
                        type="datetime-local"
                        id="scheduled_time"
                        value={formData.scheduled_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description of your needs</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        placeholder="Describe what you need help with..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="virtual_meeting_preference">Preferred Meeting Platform</label>
                    <select
                        id="virtual_meeting_preference"
                        value={formData.virtual_meeting_preference}
                        onChange={(e) => setFormData(prev => ({ ...prev, virtual_meeting_preference: e.target.value }))}
                    >
                        <option value="zoom">Zoom</option>
                        <option value="teams">Microsoft Teams</option>
                        <option value="meet">Google Meet</option>
                    </select>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Booking...' : 'Book Consultation'}
                </button>
            </form>
        </div>
    );
};

export default BookSupervisorAppointment;
