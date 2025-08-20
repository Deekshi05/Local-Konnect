import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { toast } from 'react-toastify';
import { getServiceImageUrl } from '../../utils/imageUtils';
import './practice.css';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const response = await servicesApi.getAllServices();
            setServices(response.data);
        } catch (error) {
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceClick = (serviceId) => {
        try {
            navigate(`/customer/services/${serviceId}/book`);
            console.log('Navigating to service consultation:', serviceId);
        } catch (error) {
            console.error('Navigation error:', error);
            toast.error('Failed to view service details');
        }
    };

    const handleBookConsultation = (serviceId, e) => {
        e.stopPropagation();
        try {
            navigate(`/customer/services/${serviceId}/book`);
            console.log('Navigating to book consultation for service:', serviceId);
        } catch (error) {
            console.error('Navigation error:', error);
            toast.error('Failed to book consultation');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh',
                    fontSize: '1.2rem',
                    color: '#1f3b8c'
                }}>
                    Loading services...
                </div>
            </div>
        );
    }

    return (
        <div className="services-container">
            <div className="services-header">
                <h1>Our Professional Services</h1>
                <Link to="/customer/appointments" className="appointments-link">
                    📅 View My Appointments
                </Link>
            </div>

            <div className="services-grid">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className="service-card fade-in"
                        onClick={() => handleServiceClick(service.id)}
                    >
                        {service.image ? (
                            <div className="service-image">
                                <img src={getServiceImageUrl(service)} alt={service.name} />
                            </div>
                        ) : (
                            <div className="service-image">
                                {/* Fallback icon will be added via CSS */}
                            </div>
                        )}
                        <div className="service-content">
                            <h3>{service.name}</h3>
                            <p>{service.description}</p>
                            <div className="service-actions">
                                <button
                                    onClick={(e) => handleBookConsultation(service.id, e)}
                                    className="book-button"
                                >
                                    <i className="fas fa-calendar-plus"></i> 
                                    Book Virtual Consultation
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {services.length === 0 && (
                <div className="no-services">
                    <p>No services available at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default Services;
