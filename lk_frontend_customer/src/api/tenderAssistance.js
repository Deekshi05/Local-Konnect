import api from './axiosConfig';

export const tenderAssistanceApi = {
    // Create tender assistance
    createAssistance: (data) => api.post('/tender-assistance/create/', data),
    
    // Get customer's tender assistance records
    getCustomerAssistance: () => api.get('/tender-assistance/customer/'),
    
    // Create an assisted tender
    createAssistedTender: (data) => api.post('/tenders/assisted/create/', data)
};
