import api from './axiosConfig';

export const consultationApi = {
    // Virtual Appointments
    createVirtualAppointment: (data) => api.post('/appointments/virtual/create/', data),
    getCustomerVirtualAppointments: () => api.get('/appointments/virtual/customer/'),
    updateVirtualAppointment: (id, data) => api.patch(`/appointments/virtual/${id}/update/`, data),
    assessComplexity: (id, data) => api.post(`/appointments/virtual/${id}/assess-complexity/`, data),

    // Physical Visits
    createPhysicalVisit: (data) => api.post('/visits/physical/create/', data),
    getCustomerPhysicalVisits: () => api.get('/visits/physical/customer/'),
    updatePhysicalVisit: (id, data) => api.patch(`/visits/physical/${id}/update/`, data),
    confirmVisitPayment: (visitId, data) => api.post(`/visits/physical/${visitId}/payment/confirm/`, data),

    // Tender Assistance
    createTenderAssistance: (data) => api.post('/tender-assistance/create/', data),
    getCustomerTenderAssistance: () => api.get('/tender-assistance/customer/'),
    getSupervisorTenderAssistance: () => api.get('/tender-assistance/supervisor/'),
    createAssistedTender: (data) => api.post('/tenders/assisted/create/', data)
};
