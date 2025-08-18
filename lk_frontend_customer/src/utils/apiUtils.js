import { toast } from 'react-toastify';

export const handleApiError = (error, customMessage = '') => {
    console.error('API Error:', error);

    let errorMessage = customMessage || 'An error occurred. Please try again.';

    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.detail) {
            errorMessage = error.response.data.detail;
        } else if (error.response.status === 401) {
            errorMessage = 'Please login to continue';
            // You might want to redirect to login page here
        } else if (error.response.status === 403) {
            errorMessage = 'You are not authorized to perform this action';
        } else if (error.response.status === 404) {
            errorMessage = 'Resource not found';
        } else if (error.response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
        }
    } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
    }

    toast.error(errorMessage);
    return errorMessage;
};

export const handleApiSuccess = (message = 'Operation successful') => {
    toast.success(message);
    return message;
};

export const formatValidationErrors = (errors) => {
    if (typeof errors === 'string') {
        return errors;
    }
    
    if (Array.isArray(errors)) {
        return errors.join(', ');
    }
    
    if (typeof errors === 'object') {
        return Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
    }
    
    return 'Invalid input. Please check your data.';
};
