import api from './axiosConfig';

export const supervisorApi = {
    // Get supervisor services
    getSupervisorServices: () => api.get('/supervisor/services/'),
    
    // Get supervisor tenders
    getSupervisorTenders: () => api.get('/tenders/supervisor/'),

    // Get virtual appointments for supervisor
    getSupervisorVirtualAppointments: () => api.get('/appointments/virtual/supervisor/'),
    
    // Get physical visits for supervisor
    getSupervisorPhysicalVisits: () => api.get('/visits/physical/supervisor/'),
    
    // Update supervisor service
    updateSupervisorService: (serviceId, data) => api.put(`/supervisor/services/${serviceId}/`, data),
    
    // Delete supervisor service
    deleteSupervisorService: (serviceId) => api.delete(`/supervisor/services/${serviceId}/`)
};
