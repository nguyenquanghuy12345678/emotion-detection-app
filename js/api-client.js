// ============================================
// API CLIENT - FRONTEND TO BACKEND CONNECTION
// Handle all API requests with authentication
// ============================================

class APIClient {
    constructor() {
        // Auto-detect base URL based on environment
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
        
        this.baseURL = isLocal
            ? 'http://localhost:3000/api'
            : '/api'; // Vercel will route this to serverless functions
        
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        
        console.log('🔌 API Client initialized:', this.baseURL);
        console.log('🌍 Environment:', isLocal ? 'Local' : 'Production (Vercel)');
    }

    // ============================================
    // AUTHENTICATION METHODS
    // ============================================

    async register(email, password, fullName) {
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, fullName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Save token and user
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            return data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save token and user
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.reload();
    }

    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        return this.user;
    }

    async getMe() {
        try {
            const response = await this.request('GET', '/auth/me');
            this.user = response.user;
            localStorage.setItem('user', JSON.stringify(this.user));
            return response.user;
        } catch (error) {
            console.error('Get me error:', error);
            throw error;
        }
    }

    // ============================================
    // GENERIC REQUEST METHOD
    // ============================================

    async request(method, endpoint, body = null) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            method,
            headers
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle unauthorized
                if (response.status === 401 || response.status === 403) {
                    this.logout();
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request error:', error);
            throw error;
        }
    }

    // ============================================
    // WORK SESSION METHODS
    // ============================================

    async startSession(sessionType = 'work') {
        return await this.request('POST', '/sessions/start', { sessionType });
    }

    async endSession(sessionId, focusScore, pomodoroCount) {
        return await this.request('POST', `/sessions/end?id=${sessionId}`, { 
            focusScore, 
            pomodoroCount 
        });
    }

    async getSessions(limit = 10) {
        return await this.request('GET', `/sessions?limit=${limit}`);
    }

    async getActiveSession() {
        return await this.request('GET', '/sessions/active');
    }

    // ============================================
    // EMOTION TRACKING METHODS
    // ============================================

    async saveEmotion(sessionId, emotion, confidence, focusScore, metadata = {}) {
        return await this.request('POST', '/emotions', {
            sessionId,
            emotion,
            confidence,
            focusScore,
            metadata
        });
    }

    async getEmotionHistory(startDate, endDate, limit = 1000) {
        const params = new URLSearchParams({
            startDate: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: endDate || new Date().toISOString(),
            limit: limit.toString()
        });
        return await this.request('GET', `/emotions?${params}`);
    }

    async getEmotionDistribution(date) {
        const params = new URLSearchParams({
            date: date || new Date().toISOString().split('T')[0]
        });
        return await this.request('GET', `/emotions/distribution?${params}`);
    }

    // ============================================
    // PRODUCTIVITY STATS METHODS
    // ============================================

    async updateDailyStats(date, stats) {
        return await this.request('POST', '/stats/daily', { date, stats });
    }

    async getDailyStats(date) {
        const params = new URLSearchParams({
            date: date || new Date().toISOString().split('T')[0]
        });
        return await this.request('GET', `/stats/daily?${params}`);
    }

    async getStatsRange(startDate, endDate) {
        const params = new URLSearchParams({
            startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: endDate || new Date().toISOString().split('T')[0]
        });
        return await this.request('GET', `/stats/range?${params}`);
    }

    async getWeeklyStats() {
        return await this.request('GET', '/stats/weekly');
    }

    // ============================================
    // WORK NOTES METHODS
    // ============================================

    async createNote(sessionId, noteText, emotion, focusScore, tags = []) {
        return await this.request('POST', '/notes', {
            sessionId,
            noteText,
            emotion,
            focusScore,
            tags
        });
    }

    async getNotes(limit = 50) {
        return await this.request('GET', `/notes?limit=${limit}`);
    }

    async deleteNote(noteId) {
        return await this.request('DELETE', `/notes?id=${noteId}`);
    }

    // ============================================
    // DASHBOARD METHODS
    // ============================================

    async getDashboard() {
        return await this.request('GET', '/dashboard');
    }

    // ============================================
    // EXPORT TRACKING METHODS
    // ============================================

    async logExport(exportType, dateRangeStart, dateRangeEnd, fileName) {
        return await this.request('POST', '/exports', {
            exportType,
            dateRangeStart,
            dateRangeEnd,
            fileName
        });
    }

    async getExportHistory(limit = 20) {
        return await this.request('GET', `/exports?limit=${limit}`);
    }

    // ============================================
    // HEALTH CHECK
    // ============================================

    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return await response.json();
        } catch (error) {
            return {
                status: 'error',
                message: 'Cannot connect to server'
            };
        }
    }

    async ping() {
        try {
            const response = await fetch(`${this.baseURL}/ping`);
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    // ============================================
    // SYNC METHODS - BATCH OPERATIONS
    // ============================================

    async syncEmotions(emotions) {
        // Batch save emotions
        const promises = emotions.map(emotion => 
            this.saveEmotion(
                emotion.sessionId,
                emotion.emotion,
                emotion.confidence,
                emotion.focusScore,
                emotion.metadata
            )
        );

        try {
            await Promise.all(promises);
            return { success: true, count: emotions.length };
        } catch (error) {
            console.error('Sync emotions error:', error);
            throw error;
        }
    }

    async syncStats(date, stats) {
        // Sync daily stats to server
        try {
            await this.updateDailyStats(date, stats);
            return { success: true };
        } catch (error) {
            console.error('Sync stats error:', error);
            throw error;
        }
    }

    // ============================================
    // AUTO-SYNC FUNCTIONALITY
    // ============================================

    startAutoSync(intervalMinutes = 5) {
        // Auto-sync every N minutes
        this.syncInterval = setInterval(async () => {
            if (!this.isAuthenticated()) return;

            try {
                console.log('🔄 Auto-syncing data...');
                
                // Sync today's stats
                const today = new Date().toISOString().split('T')[0];
                const stats = window.productivityTracker?.getCurrentStats();
                
                if (stats) {
                    await this.syncStats(today, stats);
                    console.log('✅ Auto-sync completed');
                }
            } catch (error) {
                console.error('❌ Auto-sync failed:', error);
            }
        }, intervalMinutes * 60 * 1000);

        console.log(`✅ Auto-sync enabled (every ${intervalMinutes} minutes)`);
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏹️ Auto-sync stopped');
        }
    }
}

// Initialize API Client globally
window.apiClient = new APIClient();
console.log('✅ API Client ready');

// Auto-connect check
(async function() {
    const health = await window.apiClient.healthCheck();
    if (health.status === 'ok') {
        console.log('✅ Backend server connected:', health);
    } else {
        console.warn('⚠️ Backend server not available. Running in offline mode.');
    }
})();
