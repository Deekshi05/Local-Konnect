import api from './axiosConfig';

export const servicesApi = {
    // Service Management
    getAllServices: () => api.get('/services/'),
    getServiceById: (id) => api.get(`/services/${id}/`),
    
    // Get contractors by service
    getContractorsByService: (serviceId) => api.get(`/services/${serviceId}/contractors/`),
    
    // Get supervisors by service - FIXED ENDPOINT
    getSupervisorsByService: (serviceId) => api.get(`/services/${serviceId}/supervisors/`),
    
    // Supervisor Services
    getSupervisorServices: () => api.get('/supervisor/services/'),
    deleteSupervisorService: (serviceId) => api.delete(`/supervisor/services/${serviceId}/`),
    
    // Virtual Appointments
    bookVirtualAppointment: (data) => api.post('/appointments/virtual/create/', data),
    getUserVirtualAppointments: () => api.get('/appointments/virtual/customer/'),
    getSupervisorVirtualAppointments: () => api.get('/appointments/virtual/supervisor/'),
    updateVirtualAppointment: (id, data) => api.patch(`/appointments/virtual/${id}/update/`, data),
    markVirtualAppointmentCompleted: (id, notes = '') => api.patch(`/appointments/virtual/${id}/update/`, {
        status: 'completed',
        notes: notes
    }),
    assessAppointmentComplexity: (id, data) => api.post(`/appointments/virtual/${id}/assess-complexity/`, data),

    // Physical Visits
    bookPhysicalVisit: (data) => api.post('/visits/physical/create-after-virtual/', {
        virtual_appointment: data.virtual_appointment,
        visit_address: data.visit_address,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        estimated_duration_hours: data.estimated_duration_hours
    }),
    getUserPhysicalVisits: () => api.get('/visits/physical/customer/'),
    getSupervisorPhysicalVisits: () => api.get('/visits/physical/supervisor/'),
    updatePhysicalVisit: (id, data) => api.patch(`/visits/physical/${id}/update/`, data),
    confirmPhysicalVisitPayment: (visitId) => api.post(`/visits/physical/${visitId}/payment/confirm/`, { payment_status: 'confirmed' }),

    // Tender Creation Assistance
    createTenderAssistance: (data) => api.post('/tender-assistance/create/', data),
    getCustomerTenderAssistance: () => api.get('/tender-assistance/customer/'),
    getSupervisorTenderAssistance: () => api.get('/tender-assistance/supervisor/'),

    // Tender Management - CORRECTED ENDPOINTS
    createTender: (data) => api.post('/tenders/create/', data),
    createTenderFromAssistance: (data) => api.post('/tenders/assisted/create/', data),
    assignContractors: (data) => api.post('/tenders/assign-contractors/', data),
    
    // Tender Requirements
    addTenderRequirement: (data) => api.post('/tender-requirements/create/', data),
    getTenderRequirements: () => api.get('/requirements/'),

    // Tender Access & Status - CORRECTED ENDPOINTS
    getUserTenders: () => api.get('/tenders/customer/'),
    getTenderDetails: (id) => api.get(`/tenders/${id}/`),
    getTenderBids: (tenderId) => api.get(`/tender-bids/tender/${tenderId}/`),
    getTenderMilestones: (tenderId) => api.get(`/tenders/${tenderId}/milestones/`),
    getTenderAuditLogs: (tenderId) => api.get(`/tenders/${tenderId}/audit-log/`),
    getTenderAssistance: (assistanceId) => api.get(`/tender-assistance/customer/`), // Modified to get all and filter on frontend
    
    getContractorTenders: () => api.get('/tenders/contractor/listed/'),
    getSelectedTenders: () => api.get('/tenders/contractor/selected/'),
    getCustomerAssignments: () => api.get('/tenders/customer/assignments/'),
    getSupervisorTenders: () => api.get('/tenders/supervisor/'),
    
    // Contractor Management
    selectContractor: (tenderId, contractorId) => api.put(`/tenders/${tenderId}/select-contractor/`, { 
        selected_contractor: contractorId,
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }),
    getBidSummary: (tenderId) => api.get(`/customer/tender/${tenderId}/bid-summary/`),
    getContractorBidStatus: () => api.get('/tenders/contractor/assigned-with-bid-status/'),
    getRequirementsWithBids: (tenderId) => api.get(`/tenders/${tenderId}/requirements-with-bids/`),
    submitAllBids: (tenderId, data) => api.post(`/tenders/${tenderId}/submit-bids/`, data),
    cancelTender: (tenderId) => api.post(`/tenders/${tenderId}/cancel/`)
};

export default servicesApi;
