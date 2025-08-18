import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultationApi } from '../../api/consultation';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './SupervisorConsultation.css';

const SupervisorConsultation = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [virtualAppointments, setVirtualAppointments] = useState([]);
    const [physicalVisits, setPhysicalVisits] = useState([]);
    const [assistanceRecords, setAssistanceRecords] = useState([]);

    useEffect(() => {
        loadConsultationData();
    }, []);

    const loadConsultationData = async () => {
        try {
            setLoading(true);
            
            const [virtualResp, physicalResp, assistanceResp] = await Promise.all([
                consultationApi.getCustomerVirtualAppointments().catch(err => ({ data: [] })),
                consultationApi.getCustomerPhysicalVisits().catch(err => ({ data: [] })),
                consultationApi.getCustomerTenderAssistance().catch(err => ({ data: [] }))
            ]);

            setVirtualAppointments(virtualResp.data || []);
            setPhysicalVisits(physicalResp.data || []);
            setAssistanceRecords(assistanceResp.data || []);
        } catch (error) {
            console.error('Error loading consultation data:', error);
            toast.error('Failed to load some consultation data. Please refresh to try again.');
            setVirtualAppointments([]);
            setPhysicalVisits([]);
            setAssistanceRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTender = (assistanceId) => {
        if (!assistanceId) {
            toast.error('Invalid assistance record');
            return;
        }
        navigate('/customer/tenders/create/assisted/' + assistanceId);
    };

    const handleBookPhysicalVisit = (appointmentId) => {
        if (!appointmentId) {
            toast.error('Invalid appointment');
            return;
        }
        navigate('/customer/appointments/' + appointmentId + '/book-visit');
    };

    const handlePaymentConfirmation = async (visitId) => {
        if (!visitId) {
            toast.error('Invalid visit');
            return;
        }
        try {
            await consultationApi.confirmVisitPayment(visitId, { payment_status: 'confirmed' });
            toast.success('Payment confirmed successfully');
            loadConsultationData(); // Reload data to update status
        } catch (error) {
            console.error('Error confirming payment:', error);
            toast.error('Failed to confirm payment. Please try again.');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="supervisor-consultation">
            <h2>My Consultations</h2>

            <section className="virtual-appointments">
                <h3>Virtual Appointments</h3>
                {virtualAppointments.length === 0 ? (
                    <p>No virtual appointments scheduled</p>
                ) : (
                    virtualAppointments.map(appointment => (
                        <div key={appointment.id} className="appointment-card">
                            <h4>Appointment with {appointment.supervisor?.user?.first_name || 'Supervisor'}</h4>
                            <p>Service: {appointment.service?.name || 'Not specified'}</p>
                            <p>Date: {appointment.scheduled_time ? new Date(appointment.scheduled_time).toLocaleString() : 'Not scheduled'}</p>
                            <p>Status: {appointment.status || 'Pending'}</p>
                            {appointment.status === 'COMPLETED' && !appointment.physical_visit && (
                                <button onClick={() => handleBookPhysicalVisit(appointment.id)}>
                                    Book Physical Visit
                                </button>
                            )}
                            <div className="meeting-details">
                                {appointment.meeting_link && (
                                    <a href={appointment.meeting_link} target="_blank" rel="noopener noreferrer">
                                        Join Meeting
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </section>

            <section className="physical-visits">
                <h3>Physical Visits</h3>
                {physicalVisits.length === 0 ? (
                    <p>No physical visits scheduled</p>
                ) : (
                    physicalVisits.map(visit => (
                        <div key={visit.id} className="visit-card">
                            <h4>Visit with {visit.supervisor?.user?.first_name || 'Supervisor'}</h4>
                            <p>Service: {visit.service?.name || 'Not specified'}</p>
                            <p>Date: {visit.scheduled_date ? new Date(visit.scheduled_date).toLocaleDateString() : 'Not scheduled'}</p>
                            <p>Status: {visit.status || 'Pending'}</p>
                            <p>Address: {visit.visit_address || 'Address not set'}</p>
                            {visit.payment_status === 'pending' && (
                                <button onClick={() => handlePaymentConfirmation(visit.id)}>
                                    Confirm Payment
                                </button>
                            )}
                        </div>
                    ))
                )}
            </section>

            <section className="assistance-records">
                <h3>Tender Assistance</h3>
                {assistanceRecords.length === 0 ? (
                    <p>No tender assistance records</p>
                ) : (
                    assistanceRecords.map(record => (
                        <div key={record.id} className="assistance-card">
                            <h4>Assistance for {record.service?.name || 'Service not specified'}</h4>
                            <p>Supervisor: {record.supervisor?.user?.first_name || 'Supervisor'} {record.supervisor?.user?.last_name || ''}</p>
                            <p>Status: {record.status || 'Pending'}</p>
                            <p>Estimated Budget: ${record.estimated_budget || 0}</p>
                            <p>Timeline: {record.project_timeline_days || 0} days</p>
                            {record.status === 'completed' && !record.tender_posted && (
                                <button onClick={() => handleCreateTender(record.id)}>
                                    Create Tender
                                </button>
                            )}
                        </div>
                    ))
                )}
            </section>

            <div className="actions">
                <button onClick={() => navigate('/appointments/book')} className="book-appointment-btn">
                    Book New Consultation
                </button>
            </div>
        </div>
    );
};

export default SupervisorConsultation;
