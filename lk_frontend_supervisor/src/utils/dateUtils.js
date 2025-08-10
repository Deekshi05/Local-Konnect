// Utility functions for date/time formatting in Indian timezone

/**
 * Format a date/time string to Indian timezone
 * @param {string} dateString - ISO date string from backend
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date/time string in IST
 */
export const formatToIndianTime = (dateString, options = {}) => {
    if (!dateString) return 'Not specified';
    
    try {
        const date = new Date(dateString);
        
        // Default formatting options for Indian timezone
        const defaultOptions = {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        // Merge with custom options
        const formatOptions = { ...defaultOptions, ...options };
        
        return date.toLocaleString('en-IN', formatOptions);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Format date only (no time) in Indian timezone
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted date string in IST
 */
export const formatToIndianDate = (dateString) => {
    return formatToIndianTime(dateString, {
        hour: undefined,
        minute: undefined,
        hour12: undefined
    });
};

/**
 * Format time only (no date) in Indian timezone
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted time string in IST
 */
export const formatToIndianTimeOnly = (dateString) => {
    return formatToIndianTime(dateString, {
        year: undefined,
        month: undefined,
        day: undefined
    });
};

/**
 * Check if a tender is currently in active bidding period
 * @param {string} startTime - ISO start time string
 * @param {string} endTime - ISO end time string
 * @returns {boolean} True if currently in bidding period
 */
export const isTenderActive = (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return start <= now && now <= end;
};

/**
 * Get relative time description (e.g., "2 hours ago", "in 3 days")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time description
 */
export const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / (1000 * 60));
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        if (Math.abs(diffMins) < 60) {
            return diffMins > 0 ? `in ${diffMins} minutes` : `${Math.abs(diffMins)} minutes ago`;
        } else if (Math.abs(diffHours) < 24) {
            return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
        } else {
            return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
        }
    } catch (error) {
        return '';
    }
};
