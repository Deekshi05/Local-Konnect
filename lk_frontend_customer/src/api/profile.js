import api from './axiosConfig';

export const profileApi = {
    getVirtualAppointments: () => api.get('/appointments/virtual/customer/'),
    getPhysicalVisits: () => api.get('/appointments/physical/customer/'),
    // Get user profile
    getProfile: () => api.get('/profile/'),

    // Update user profile
    updateProfile: (data) => api.put('/profile/', data),

    // Get user's appointments
    getAppointments: () => api.get('/appointments/virtual/customer/'),

    // Get user's physical visits
    getPhysicalVisits: () => api.get('/visits/physical/customer/'),

    // Update profile picture (customer/contractor/supervisor)
    // The backend expects PUT /api/profile/ with correct field names, e.g. for customer: { user: { first_name, last_name }, phone, address }
    // For image upload, use the correct field name and send as part of the profile update if supported
};
