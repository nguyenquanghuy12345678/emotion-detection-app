// ============================================
// NEON DATABASE CONNECTION
// Serverless PostgreSQL connection using @neondatabase/serverless
// ============================================

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

class Database {
    constructor() {
        if (!process.env.DATABASE_URL) {
            throw new Error('❌ DATABASE_URL environment variable is not set');
        }

        // Initialize Neon serverless connection
        this.sql = neon(process.env.DATABASE_URL);
        console.log('✅ Neon Database initialized');
    }

    // ============================================
    // USER OPERATIONS
    // ============================================

    async createUser(email, passwordHash, fullName = null) {
        const result = await this.sql`
            INSERT INTO users (email, password_hash, full_name)
            VALUES (${email}, ${passwordHash}, ${fullName})
            RETURNING id, email, full_name, created_at
        `;
        return result[0];
    }

    async getUserByEmail(email) {
        const result = await this.sql`
            SELECT * FROM users 
            WHERE email = ${email} AND is_active = true
        `;
        return result[0];
    }

    async getUserById(userId) {
        const result = await this.sql`
            SELECT id, email, full_name, created_at, last_login, settings 
            FROM users 
            WHERE id = ${userId} AND is_active = true
        `;
        return result[0];
    }

    async updateLastLogin(userId) {
        await this.sql`
            UPDATE users 
            SET last_login = CURRENT_TIMESTAMP 
            WHERE id = ${userId}
        `;
    }

    async updateUserSettings(userId, settings) {
        const result = await this.sql`
            UPDATE users 
            SET settings = ${JSON.stringify(settings)}::jsonb
            WHERE id = ${userId}
            RETURNING settings
        `;
        return result[0];
    }

    // ============================================
    // WORK SESSION OPERATIONS
    // ============================================

    async createWorkSession(userId, sessionType = 'work') {
        const result = await this.sql`
            INSERT INTO work_sessions (user_id, start_time, session_type)
            VALUES (${userId}, CURRENT_TIMESTAMP, ${sessionType})
            RETURNING id, start_time
        `;
        return result[0];
    }

    async endWorkSession(sessionId, focusScore, pomodoroCount) {
        const result = await this.sql`
            UPDATE work_sessions 
            SET 
                end_time = CURRENT_TIMESTAMP,
                duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time))::INTEGER,
                focus_score = ${focusScore},
                pomodoro_count = ${pomodoroCount}
            WHERE id = ${sessionId}
            RETURNING *
        `;
        return result[0];
    }

    async getActiveSession(userId) {
        const result = await this.sql`
            SELECT * FROM work_sessions 
            WHERE user_id = ${userId} AND end_time IS NULL
            ORDER BY start_time DESC
            LIMIT 1
        `;
        return result[0];
    }

    async getUserSessions(userId, limit = 10) {
        const result = await this.sql`
            SELECT * FROM work_sessions 
            WHERE user_id = ${userId}
            ORDER BY start_time DESC
            LIMIT ${limit}
        `;
        return result;
    }

    // ============================================
    // EMOTION TRACKING OPERATIONS
    // ============================================

    async saveEmotion(userId, sessionId, emotion, confidence, focusScore, metadata = {}) {
        const result = await this.sql`
            INSERT INTO emotion_history 
            (user_id, session_id, emotion, confidence, focus_score, metadata)
            VALUES 
            (${userId}, ${sessionId}, ${emotion}, ${confidence}, ${focusScore}, ${JSON.stringify(metadata)}::jsonb)
            RETURNING id, timestamp
        `;
        return result[0];
    }

    async getEmotionHistory(userId, startDate, endDate, limit = 1000) {
        const result = await this.sql`
            SELECT * FROM emotion_history 
            WHERE user_id = ${userId}
            AND timestamp >= ${startDate}
            AND timestamp <= ${endDate}
            ORDER BY timestamp DESC
            LIMIT ${limit}
        `;
        return result;
    }

    async getEmotionDistribution(userId, date) {
        const result = await this.sql`
            SELECT 
                emotion,
                COUNT(*) as count,
                AVG(confidence) as avg_confidence,
                AVG(focus_score) as avg_focus_score
            FROM emotion_history
            WHERE user_id = ${userId}
            AND DATE(timestamp) = ${date}
            GROUP BY emotion
            ORDER BY count DESC
        `;
        return result;
    }

    // ============================================
    // PRODUCTIVITY STATS OPERATIONS
    // ============================================

    async upsertDailyStats(userId, date, stats) {
        const {
            totalWorkTime,
            totalBreakTime,
            focusedTime,
            distractedTime,
            stressTime,
            happyTime,
            averageFocusScore,
            pomodoroCompleted,
            emotionsDistribution
        } = stats;

        const result = await this.sql`
            INSERT INTO productivity_stats 
            (user_id, date, total_work_time, total_break_time, focused_time, 
             distracted_time, stress_time, happy_time, average_focus_score, 
             pomodoro_completed, emotions_distribution)
            VALUES 
            (${userId}, ${date}, ${totalWorkTime}, ${totalBreakTime}, ${focusedTime}, 
             ${distractedTime}, ${stressTime}, ${happyTime}, ${averageFocusScore}, 
             ${pomodoroCompleted}, ${JSON.stringify(emotionsDistribution)}::jsonb)
            ON CONFLICT (user_id, date) DO UPDATE SET
                total_work_time = productivity_stats.total_work_time + ${totalWorkTime},
                total_break_time = productivity_stats.total_break_time + ${totalBreakTime},
                focused_time = productivity_stats.focused_time + ${focusedTime},
                distracted_time = productivity_stats.distracted_time + ${distractedTime},
                stress_time = productivity_stats.stress_time + ${stressTime},
                happy_time = productivity_stats.happy_time + ${happyTime},
                average_focus_score = ${averageFocusScore},
                pomodoro_completed = productivity_stats.pomodoro_completed + ${pomodoroCompleted},
                emotions_distribution = ${JSON.stringify(emotionsDistribution)}::jsonb,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        return result[0];
    }

    async getDailyStats(userId, date) {
        const result = await this.sql`
            SELECT * FROM productivity_stats 
            WHERE user_id = ${userId} AND date = ${date}
        `;
        return result[0];
    }

    async getStatsRange(userId, startDate, endDate) {
        const result = await this.sql`
            SELECT * FROM productivity_stats 
            WHERE user_id = ${userId}
            AND date >= ${startDate}
            AND date <= ${endDate}
            ORDER BY date DESC
        `;
        return result;
    }

    async getWeeklyStats(userId) {
        const result = await this.sql`
            SELECT * FROM v_weekly_productivity 
            WHERE user_id = ${userId}
            ORDER BY week_start DESC
            LIMIT 12
        `;
        return result;
    }

    // ============================================
    // WORK NOTES OPERATIONS
    // ============================================

    async createNote(userId, sessionId, noteText, emotion, focusScore, tags = []) {
        const result = await this.sql`
            INSERT INTO work_notes 
            (user_id, session_id, note_text, emotion, focus_score, tags)
            VALUES 
            (${userId}, ${sessionId}, ${noteText}, ${emotion}, ${focusScore}, ${tags})
            RETURNING *
        `;
        return result[0];
    }

    async getUserNotes(userId, limit = 50) {
        const result = await this.sql`
            SELECT * FROM work_notes 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT ${limit}
        `;
        return result;
    }

    async deleteNote(noteId, userId) {
        const result = await this.sql`
            DELETE FROM work_notes 
            WHERE id = ${noteId} AND user_id = ${userId}
            RETURNING id
        `;
        return result[0];
    }

    // ============================================
    // ALERT LOGS OPERATIONS
    // ============================================

    async createAlert(userId, sessionId, alertType, priority, title, message) {
        const result = await this.sql`
            INSERT INTO alert_logs 
            (user_id, session_id, alert_type, priority, title, message)
            VALUES 
            (${userId}, ${sessionId}, ${alertType}, ${priority}, ${title}, ${message})
            RETURNING *
        `;
        return result[0];
    }

    async getUnreadAlerts(userId, limit = 20) {
        const result = await this.sql`
            SELECT * FROM alert_logs 
            WHERE user_id = ${userId} AND is_read = false
            ORDER BY created_at DESC
            LIMIT ${limit}
        `;
        return result;
    }

    async markAlertAsRead(alertId, userId) {
        await this.sql`
            UPDATE alert_logs 
            SET is_read = true 
            WHERE id = ${alertId} AND user_id = ${userId}
        `;
    }

    // ============================================
    // ABSENCE TRACKING
    // ============================================

    async recordAbsenceStart(userId, sessionId, reason = 'unknown') {
        const result = await this.sql`
            INSERT INTO absence_logs 
            (user_id, session_id, start_time, reason)
            VALUES 
            (${userId}, ${sessionId}, CURRENT_TIMESTAMP, ${reason})
            RETURNING id, start_time
        `;
        return result[0];
    }

    async recordAbsenceEnd(absenceId) {
        const result = await this.sql`
            UPDATE absence_logs 
            SET 
                end_time = CURRENT_TIMESTAMP,
                duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time))::INTEGER
            WHERE id = ${absenceId}
            RETURNING *
        `;
        return result[0];
    }

    // ============================================
    // EXPORT TRACKING
    // ============================================

    async logExport(userId, exportType, dateRangeStart, dateRangeEnd, fileName) {
        const result = await this.sql`
            INSERT INTO export_history 
            (user_id, export_type, date_range_start, date_range_end, file_name)
            VALUES 
            (${userId}, ${exportType}, ${dateRangeStart}, ${dateRangeEnd}, ${fileName})
            RETURNING *
        `;
        return result[0];
    }

    async getExportHistory(userId, limit = 20) {
        const result = await this.sql`
            SELECT * FROM export_history 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT ${limit}
        `;
        return result;
    }

    // ============================================
    // ANALYTICS QUERIES
    // ============================================

    async getDashboardSummary(userId) {
        // Get comprehensive dashboard data
        const [todayStats, weekStats, emotionDist, recentSessions] = await Promise.all([
            this.getDailyStats(userId, new Date().toISOString().split('T')[0]),
            this.getWeeklyStats(userId),
            this.getEmotionDistribution(userId, new Date().toISOString().split('T')[0]),
            this.getUserSessions(userId, 5)
        ]);

        return {
            today: todayStats,
            weekly: weekStats,
            emotions: emotionDist,
            recentSessions
        };
    }

    // ============================================
    // HEALTH CHECK
    // ============================================

    async healthCheck() {
        try {
            const result = await this.sql`SELECT NOW() as current_time, version() as pg_version`;
            return {
                status: 'healthy',
                database: 'connected',
                timestamp: result[0].current_time,
                version: result[0].pg_version
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                database: 'disconnected',
                error: error.message
            };
        }
    }
}

// Export singleton instance
module.exports = new Database();
