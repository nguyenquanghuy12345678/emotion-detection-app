// ============================================
// TIMEZONE UTILITIES - GMT+7 (Vietnam Time)
// All dates in the app will use Vietnam timezone
// ============================================

const TIMEZONE_UTILS = {
    // GMT+7 offset in milliseconds
    GMT7_OFFSET: 7 * 60 * 60 * 1000,
    
    /**
     * Get current date in GMT+7
     * @returns {Date} Date object adjusted to GMT+7
     */
    nowGMT7() {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        return new Date(utcTime + this.GMT7_OFFSET);
    },
    
    /**
     * Convert any date to GMT+7
     * @param {Date|string|number} date - Date to convert
     * @returns {Date} Date object in GMT+7
     */
    toGMT7(date) {
        const d = new Date(date);
        const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000);
        return new Date(utcTime + this.GMT7_OFFSET);
    },
    
    /**
     * Format date to ISO string in GMT+7
     * @param {Date} date - Date to format (optional, defaults to now)
     * @returns {string} ISO string in GMT+7
     */
    toISOStringGMT7(date = null) {
        const d = date ? this.toGMT7(date) : this.nowGMT7();
        return d.toISOString();
    },
    
    /**
     * Get date part only (YYYY-MM-DD) in GMT+7
     * @param {Date} date - Date to format (optional, defaults to now)
     * @returns {string} Date string YYYY-MM-DD
     */
    toDateStringGMT7(date = null) {
        const d = date ? this.toGMT7(date) : this.nowGMT7();
        return d.toISOString().split('T')[0];
    },
    
    /**
     * Format time for display in Vietnamese format
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted time string
     */
    toLocaleTimeString(date = null) {
        const d = date ? this.toGMT7(date) : this.nowGMT7();
        return d.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    },
    
    /**
     * Format date for display in Vietnamese format
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    toLocaleDateString(date = null) {
        const d = date ? this.toGMT7(date) : this.nowGMT7();
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },
    
    /**
     * Format datetime for display in Vietnamese format
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted datetime string
     */
    toLocaleDateTimeString(date = null) {
        const d = date ? this.toGMT7(date) : this.nowGMT7();
        return d.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    },
    
    /**
     * Get date range for last N days in GMT+7
     * @param {number} days - Number of days
     * @returns {Object} Object with startDate and endDate
     */
    getDateRange(days = 7) {
        const endDate = this.nowGMT7();
        const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
        
        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            startDateString: startDate.toISOString().split('T')[0],
            endDateString: endDate.toISOString().split('T')[0]
        };
    },
    
    /**
     * Get timestamp in GMT+7
     * @returns {number} Timestamp in milliseconds
     */
    getTimestamp() {
        return this.nowGMT7().getTime();
    },
    
    /**
     * Format duration in seconds to readable string
     * @param {number} seconds - Duration in seconds
     * @returns {string} Formatted duration string
     */
    formatDuration(seconds) {
        if (!seconds || seconds < 0) return '0 giây';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        const parts = [];
        if (hours > 0) parts.push(`${hours} giờ`);
        if (minutes > 0) parts.push(`${minutes} phút`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs} giây`);
        
        return parts.join(' ');
    },
    
    /**
     * Get current hour in GMT+7 (0-23)
     * @returns {number} Current hour
     */
    getCurrentHour() {
        return this.nowGMT7().getHours();
    },
    
    /**
     * Get greeting based on time of day in GMT+7
     * @returns {string} Greeting message
     */
    getGreeting() {
        const hour = this.getCurrentHour();
        
        if (hour < 6) return 'Chào buổi tối';
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TIMEZONE_UTILS;
}
