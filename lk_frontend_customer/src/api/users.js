import api from './axiosConfig';

export const userApi = {
    // Get all supervisors
    getAllSupervisors: () => api.get('/supervisors/'),

    // Get supervisors by service - FIXED ENDPOINT
    getSupervisorsByService: (serviceId) => api.get(`/services/${serviceId}/supervisors/`),

    // Get contractors filtered by service
    getContractorsByService: (serviceId) => api.get(`/services/${serviceId}/contractors/`),

    // Get all contractors
    getAllContractors: () => api.get('/contractors/')
};
