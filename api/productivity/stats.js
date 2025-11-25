// ============================================
// PRODUCTIVITY STATS API - Vercel Serverless
// Get complete productivity data for export
// ============================================

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get user from token
        const authHeader = req.headers.authorization;
        let userId = null;
        let isGuest = true;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId;
                isGuest = false;
            } catch (err) {
                console.warn('Invalid token, treating as guest');
            }
        }

        // For guest users, return empty data
        if (isGuest || !userId) {
            return res.status(200).json({
                success: true,
                isGuest: true,
                data: {
                    totalWorkTime: 0,
                    focusedTime: 0,
                    distractedTime: 0,
                    totalBreakTime: 0,
                    happyTime: 0,
                    stressTime: 0,
                    averageFocusScore: 0,
                    pomodoroCompleted: 0,
                    emotionDistribution: {},
                    totalEmotionRecords: 0,
                    emotionHistory: [],
                    sessions: 0,
                    user: {
                        id: 'guest',
                        email: 'guest@local',
                        full_name: 'Khách'
                    }
                }
            });
        }

        const sql = neon(process.env.DATABASE_URL);

        // Get user info
        const userResult = await sql`
            SELECT id, email, full_name, created_at, last_login
            FROM users 
            WHERE id = ${userId}
        `;

        if (!userResult || userResult.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult[0];

        // Get date range (today by default)
        const { startDate, endDate } = req.query;
        const today = new Date().toISOString().split('T')[0];
        const start = startDate || today;
        const end = endDate || today;

        // Get work sessions
        const sessions = await sql`
            SELECT 
                id,
                start_time,
                end_time,
                duration_seconds,
                focus_score,
                pomodoro_count,
                session_type
            FROM work_sessions 
            WHERE user_id = ${userId} 
            AND DATE(start_time) >= ${start}
            AND DATE(start_time) <= ${end}
            ORDER BY start_time DESC
        `;

        // Get emotions
        const emotions = await sql`
            SELECT 
                id,
                session_id,
                emotion,
                confidence,
                focus_score,
                timestamp
            FROM emotion_history
            WHERE user_id = ${userId}
            AND DATE(timestamp) >= ${start}
            AND DATE(timestamp) <= ${end}
            ORDER BY timestamp DESC
            LIMIT 500
        `;

        // Calculate statistics
        let totalWorkTime = 0;
        let focusedTime = 0;
        let distractedTime = 0;
        let totalBreakTime = 0;
        let pomodoroCompleted = 0;
        let totalFocusScore = 0;
        let focusScoreCount = 0;

        sessions.forEach(session => {
            if (session.duration_seconds) {
                totalWorkTime += session.duration_seconds;
                
                const sessionFocus = session.focus_score || 0;
                if (sessionFocus >= 70) {
                    focusedTime += session.duration_seconds;
                } else {
                    distractedTime += session.duration_seconds;
                }
                
                totalFocusScore += sessionFocus;
                focusScoreCount++;
                pomodoroCompleted += session.pomodoro_count || 0;
            }
        });

        // Emotion distribution and time calculation
        const emotionDistribution = {};
        const emotionTimes = {
            happy: 0,
            sad: 0,
            angry: 0,
            neutral: 0,
            surprised: 0,
            fearful: 0,
            disgusted: 0
        };

        emotions.forEach((emotion, index) => {
            const emotionName = emotion.emotion;
            emotionDistribution[emotionName] = (emotionDistribution[emotionName] || 0) + 1;
            
            // Calculate time between emotions (assuming 10s interval)
            const timeInterval = 10;
            
            if (emotionTimes[emotionName] !== undefined) {
                emotionTimes[emotionName] += timeInterval;
            }
            
            // Add focus/distracted time from emotions
            if (index > 0) { // Skip first to avoid double counting
                const emotionFocus = emotion.focus_score || 0;
                if (emotionFocus >= 70 && totalWorkTime === 0) {
                    focusedTime += timeInterval;
                } else if (emotionFocus < 70 && totalWorkTime === 0) {
                    distractedTime += timeInterval;
                }
                
                if (totalWorkTime === 0) {
                    totalWorkTime += timeInterval;
                }
            }
        });

        // Calculate emotion-based times
        const happyTime = emotionTimes.happy || 0;
        const stressTime = (emotionTimes.angry || 0) + (emotionTimes.fearful || 0);

        // Calculate averages
        const averageFocusScore = focusScoreCount > 0 
            ? Math.round(totalFocusScore / focusScoreCount) 
            : (emotions.length > 0 
                ? Math.round(emotions.reduce((sum, e) => sum + (e.focus_score || 0), 0) / emotions.length)
                : 0);

        // Get notes
        const notes = await sql`
            SELECT 
                id,
                note_text,
                emotion,
                focus_score,
                created_at,
                tags
            FROM work_notes
            WHERE user_id = ${userId}
            AND DATE(created_at) >= ${start}
            AND DATE(created_at) <= ${end}
            ORDER BY created_at DESC
            LIMIT 20
        `;

        // Response data with complete user info
        const statsData = {
            totalWorkTime: Math.round(totalWorkTime),
            focusedTime: Math.round(focusedTime),
            distractedTime: Math.round(distractedTime),
            totalBreakTime: Math.round(totalBreakTime),
            happyTime: Math.round(happyTime),
            stressTime: Math.round(stressTime),
            averageFocusScore,
            pomodoroCompleted,
            emotionDistribution,
            totalEmotionRecords: emotions.length,
            emotionHistory: emotions.slice(0, 50).map(e => ({
                emotion: e.emotion,
                confidence: e.confidence,
                focusScore: e.focus_score,
                timestamp: e.timestamp,
                sessionId: e.session_id
            })),
            workSessions: sessions.map(s => ({
                id: s.id,
                startTime: s.start_time,
                endTime: s.end_time,
                duration: s.duration_seconds,
                focusScore: s.focus_score,
                pomodoroCount: s.pomodoro_count,
                type: s.session_type
            })),
            workNotes: notes.map(n => ({
                id: n.id,
                text: n.note_text,
                emotion: n.emotion,
                focusScore: n.focus_score,
                createdAt: n.created_at,
                tags: n.tags
            })),
            sessions: sessions.length,
            dateRange: { start, end },
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                created_at: user.created_at,
                last_login: user.last_login
            }
        };

        res.status(200).json({
            success: true,
            isGuest: false,
            data: statsData
        });

    } catch (error) {
        console.error('Error fetching productivity stats:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
