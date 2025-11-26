// ============================================
// SERVER-SIDE TIMEZONE UTILITIES - GMT+7 (Vietnam Time)
// All server dates will use Vietnam timezone
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
    }
};

module.exports = TIMEZONE_UTILS;
