// Utility functions for date/time formatting in Indian timezone

/**
 * Format a date/time string to Indian timezone
 * @param {string} dateString - ISO date string from backend
 * @param {Object} options - Formatting options
 * @param {boolean} isAlreadyIST - Set to true if backend date is already in IST
 * @returns {string} Formatted date/time string in IST
 */
export const formatToIndianTime = (dateString, options = {}, isAlreadyIST = false) => {
    if (!dateString) return 'Not specified';
    
    try {
        let date;
        
        if (isAlreadyIST) {
            // If the date is already in IST, don't apply timezone conversion
            date = new Date(dateString);
            
            // Default formatting options without timezone conversion
            const defaultOptions = {
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
        } else {
            // If the date is in UTC, convert to IST
            date = new Date(dateString);
            
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
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Format date only (no time) in Indian timezone
 * @param {string} dateString - ISO date string from backend
 * @param {boolean} isAlreadyIST - Set to true if backend date is already in IST
 * @returns {string} Formatted date string in IST
 */
export const formatToIndianDate = (dateString, isAlreadyIST = false) => {
    return formatToIndianTime(dateString, {
        hour: undefined,
        minute: undefined,
        hour12: undefined
    }, isAlreadyIST);
};

/**
 * Format time only (no date) in Indian timezone
 * @param {string} dateString - ISO date string from backend
 * @param {boolean} isAlreadyIST - Set to true if backend date is already in IST
 * @returns {string} Formatted time string in IST
 */
export const formatToIndianTimeOnly = (dateString, isAlreadyIST = false) => {
    return formatToIndianTime(dateString, {
        year: undefined,
        month: undefined,
        day: undefined
    }, isAlreadyIST);
};

/**
 * Format date/time without timezone conversion (use time as-is from backend)
 * @param {string} dateString - ISO date string from backend
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date/time string without timezone conversion
 */
export const formatDateTime = (dateString, options = {}) => {
    if (!dateString) return 'Not specified';
    
    try {
        const date = new Date(dateString);
        
        // Default formatting options without timezone conversion
        const defaultOptions = {
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
 * Format date only without timezone conversion
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
    return formatDateTime(dateString, {
        hour: undefined,
        minute: undefined,
        hour12: undefined
    });
};

/**
 * Format time only without timezone conversion
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted time string
 */
export const formatTimeOnly = (dateString) => {
    return formatDateTime(dateString, {
        year: undefined,
        month: undefined,
        day: undefined
    });
};

/**
 * Auto-detect and format date/time considering timezone issues
 * This function tries to detect if the backend date is already in IST
 * @param {string} dateString - ISO date string from backend
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date/time string in IST
 */
export const formatToIndianTimeAuto = (dateString, options = {}) => {
    if (!dateString) return 'Not specified';
    
    try {
        // Check if the date string has timezone information
        const hasTimezone = dateString.includes('Z') || dateString.includes('+') || dateString.includes('-');
        
        if (hasTimezone) {
            // If it has timezone info, it's likely UTC or properly formatted
            return formatToIndianTime(dateString, options, false);
        } else {
            // If no timezone info, it's likely already in IST from backend
            return formatToIndianTime(dateString, options, true);
        }
    } catch (error) {
        console.error('Error auto-formatting date:', error);
        return 'Invalid date';
    }
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
