// Utility functions for timezone conversion between Indian Standard Time (IST) and UTC

/**
 * Convert Indian Standard Time to UTC
 * IST is UTC+5:30, so to convert IST to UTC, we subtract 5 hours and 30 minutes
 * @param {string} istDateTimeString - Date time string in IST format (YYYY-MM-DDTHH:mm:ss)
 * @returns {string} ISO string in UTC
 */
export const convertISTToUTC = (istDateTimeString) => {
    try {
        const date = new Date(istDateTimeString);
        // Subtract 5 hours and 30 minutes (5.5 * 60 * 60 * 1000 milliseconds)
        const utcDate = new Date(date.getTime() - (5.5 * 60 * 60 * 1000));
        return utcDate.toISOString();
    } catch (error) {
        console.error('Error converting IST to UTC:', error);
        return null;
    }
};

/**
 * Convert UTC to Indian Standard Time
 * UTC to IST requires adding 5 hours and 30 minutes
 * @param {string} utcDateTimeString - Date time string in UTC format
 * @returns {string} ISO string in IST
 */
export const convertUTCToIST = (utcDateTimeString) => {
    try {
        const date = new Date(utcDateTimeString);
        // Add 5 hours and 30 minutes (5.5 * 60 * 60 * 1000 milliseconds)
        const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
        return istDate.toISOString();
    } catch (error) {
        console.error('Error converting UTC to IST:', error);
        return null;
    }
};

/**
 * Format datetime for form inputs (YYYY-MM-DD and HH:mm format)
 * @param {string} dateTimeString - ISO date time string
 * @returns {Object} Object with date and time strings for form inputs
 */
export const formatDateTimeForInput = (dateTimeString) => {
    try {
        const date = new Date(dateTimeString);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = date.toTimeString().slice(0, 5); // HH:mm
        return { date: dateStr, time: timeStr };
    } catch (error) {
        console.error('Error formatting datetime for input:', error);
        return { date: '', time: '' };
    }
};

/**
 * Get current IST time formatted for form inputs
 * @returns {Object} Object with current date and time in IST for form inputs
 */
export const getCurrentISTForInput = () => {
    const now = new Date();
    // Add 5 hours and 30 minutes to get IST
    const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return formatDateTimeForInput(istNow.toISOString());
};

/**
 * Validate if a date/time is in the future relative to IST
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @param {string} timeString - Time string (HH:mm)
 * @returns {boolean} True if the datetime is in the future
 */
export const isDateTimeInFuture = (dateString, timeString) => {
    try {
        // Create input datetime assuming it's in IST
        const inputDateTimeString = `${dateString}T${timeString}:00`;
        
        // Get current time in IST
        const now = new Date();
        const currentIST = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
        
        // Create input datetime in IST timezone
        const inputDateTime = new Date(inputDateTimeString);
        
        // Add a small buffer (1 minute) to account for processing time
        const nowWithBuffer = new Date(currentIST.getTime() + (1 * 60 * 1000));
        
        // For debugging
        console.log('Input datetime (treated as IST):', inputDateTime);
        console.log('Current IST time with buffer:', nowWithBuffer);
        console.log('Input string:', inputDateTimeString);
        console.log('Is future?', inputDateTime > nowWithBuffer);
        
        return inputDateTime > nowWithBuffer;
    } catch (error) {
        console.error('Error validating future datetime:', error);
        return false;
    }
};

/**
 * Format a UTC datetime string to display in IST
 * @param {string} utcDateTimeString - UTC datetime string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted datetime string in IST
 */
export const formatUTCToISTDisplay = (utcDateTimeString, options = {}) => {
    try {
        const date = new Date(utcDateTimeString);
        
        const defaultOptions = {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return date.toLocaleString('en-IN', formatOptions);
    } catch (error) {
        console.error('Error formatting UTC to IST display:', error);
        return 'Invalid date';
    }
};
