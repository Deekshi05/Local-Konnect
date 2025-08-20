import api from './axiosConfig';

export const tendersApi = {
    // Create a new tender
    createTender: (data) => api.post('/tenders/create/', data),
    
    // Create assisted tender
    createAssistedTender: (data) => api.post('/tenders/assisted/create/', data),
    
    // Assign contractors to a tender
    assignContractors: (data) => api.post('/tenders/assign-contractors/', data),
    
    // Add requirements to a tender
    addRequirement: (data) => api.post('/tender-requirements/create/', data),
    
    // Get all tenders for the current user
    getUserTenders: () => api.get('/tenders/customer/'),
    
    // Get tender details by ID
    getTenderById: (id) => api.get(`/tenders/${id}/`),
    
    // Get tender bids for customers (detailed list)
    getTenderBids: (tenderId) => api.get(`/customer/tender-bids/${tenderId}/`),
    
    // Get tender bid summary for customers (grouped by contractor)
    getTenderBidSummary: (tenderId) => api.get(`/customer/tender/${tenderId}/bid-summary/`),
    
    // Get tender milestones
    getTenderMilestones: (tenderId) => api.get(`/tenders/${tenderId}/milestones/`),
    
    // Get tender audit logs
    getTenderAuditLogs: (tenderId) => api.get(`/tenders/${tenderId}/audit-log/`),
    
    // Select contractor for a tender
    selectContractor: (tenderId, contractorId) => api.put(`/tenders/${tenderId}/select-contractor/`, { 
        selected_contractor: contractorId,
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }),
    
    // Mark tender as complete
    markTenderComplete: (tenderId) => api.patch(`/tenders/${tenderId}/complete/`),
    
    // Get requirements list
    getRequirementsList: () => api.get('/requirements/'),
    
    // Get tender assistance details
    getTenderAssistance: (assistanceId) => api.get(`/tender-assistance/${assistanceId}/`),
    
    // Get customer tender assistance
    getCustomerTenderAssistance: () => api.get('/tender-assistance/customer/')
};

// Export individual functions for easier imports
export const createTender = tendersApi.createTender;
export const createAssistedTender = tendersApi.createAssistedTender;
export const assignContractors = tendersApi.assignContractors;
export const addRequirement = tendersApi.addRequirement;
export const getUserTenders = tendersApi.getUserTenders;
export const getTenderById = tendersApi.getTenderById;
export const getBidsForTender = tendersApi.getTenderBids;
export const getTenderBidSummary = tendersApi.getTenderBidSummary;
export const getTenderMilestones = tendersApi.getTenderMilestones;
export const getTenderAuditLogs = tendersApi.getTenderAuditLogs;
export const selectContractor = tendersApi.selectContractor;
export const getRequirementsList = tendersApi.getRequirementsList;
export const getTenderAssistance = tendersApi.getTenderAssistance;
export const getCustomerTenderAssistance = tendersApi.getCustomerTenderAssistance;
