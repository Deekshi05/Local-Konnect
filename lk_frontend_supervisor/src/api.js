import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle token expiration and other errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log the full error for debugging
    console.debug('API Error:', {
      config: error.config,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('Access denied. Please check your permissions.');
    } else if (error.response?.status === 404) {
      console.error('Resource not found. Please check the API endpoint.');
    } else if (error.response?.status >= 500) {
      console.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. Please check your internet connection.');
    } else if (!error.response) {
      console.error('Network error. Please check your internet connection.');
    }

    // Add error details to the error object for better handling
    error.friendlyMessage = 
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'An unexpected error occurred. Please try again.';

    return Promise.reject(error);
  }
);

export default api;

// Supervisor API functions
export const supervisorApi = {
  // Services
  getServices: () => api.get('/supervisor/services/'),
  createService: (data) => api.post('/supervisor/services/', data),
  updateService: (serviceId, data) => api.put(`/supervisor/services/${serviceId}/`, data),
  deleteService: (serviceId) => api.delete(`/supervisor/services/${serviceId}/`),
  
  // Tenders
  getTenders: () => api.get('/tenders/supervisor/'),
  createTender: (data) => api.post('/tenders/', data),
  updateTender: (tenderId, data) => api.put(`/tenders/${tenderId}/`, data),
  deleteTender: (tenderId) => api.delete(`/tenders/${tenderId}/`),
  
  // Tender Progress Management
  getTenderProgress: (tenderId) => api.get(`/tenders/${tenderId}/progress/`),
  updateTenderProgress: (tenderId, data) => api.put(`/tenders/${tenderId}/progress/`, data),
  
  // Tender Milestones
  getTenderMilestones: (tenderId) => api.get(`/tenders/${tenderId}/milestones/`),
  createTenderMilestone: (tenderId, data) => api.post(`/tenders/${tenderId}/milestones/`, data),
  updateTenderMilestone: (milestoneId, data) => api.put(`/tender-milestones/${milestoneId}/`, data),
  deleteTenderMilestone: (milestoneId) => api.delete(`/tender-milestones/${milestoneId}/`),
  
  // Progress Notes
  getTenderProgressNotes: (tenderId) => api.get(`/tenders/${tenderId}/progress-notes/`),
  createTenderProgressNote: (tenderId, data) => api.post(`/tenders/${tenderId}/progress-notes/`, data),
  
  // Virtual Appointments
  getVirtualAppointments: () => api.get('/appointments/virtual/supervisor/'),
  updateVirtualAppointment: (appointmentId, data) => api.put(`/appointments/virtual/${appointmentId}/`, data),
  assessComplexity: (appointmentId, data) => api.post(`/appointments/virtual/${appointmentId}/assess-complexity/`, data),
  
  // Physical Visits
  getPhysicalVisits: () => api.get('/visits/physical/supervisor/'),
  updatePhysicalVisit: (visitId, data) => api.put(`/visits/physical/${visitId}/`, data),
  
  // Tender Assistance
  getTenderAssistance: () => api.get('/tender-assistance/supervisor/'),
  createAssistedTender: (data) => api.post('/tenders/assisted/create/', data),
  
  // General services
  getAllServices: () => api.get('/services/'),
  
  // Customers and Contractors (for reference)
  getCustomers: () => api.get('/customers/'),
  getContractors: () => api.get('/contractors/'),
  
  // Requirements
  getRequirements: () => api.get('/requirements/'),
};
