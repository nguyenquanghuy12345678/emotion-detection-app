// ============================================
// EXPRESS SERVER WITH NEON DATABASE
// Backend API for Emotion Detection & Productivity Tracker
// ============================================

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TIMEZONE_UTILS = require('./server-timezone-utils');
require('dotenv').config();

const db = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from root

// Request logging
app.use((req, res, next) => {
    console.log(`${TIMEZONE_UTILS.toISOStringGMT7()} - ${req.method} ${req.path}`);
    next();
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await db.createUser(email, passwordHash, fullName);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await db.updateLastLogin(user.id);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                lastLogin: user.last_login
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

// ============================================
// WORK SESSION ROUTES
// ============================================

// Start work session
app.post('/api/sessions/start', authenticateToken, async (req, res) => {
    try {
        const { sessionType } = req.body;
        
        // Check for active session
        const activeSession = await db.getActiveSession(req.user.userId);
        if (activeSession) {
            return res.status(400).json({ 
                error: 'Active session already exists',
                session: activeSession 
            });
        }

        const session = await db.createWorkSession(req.user.userId, sessionType || 'work');
        
        res.status(201).json({
            message: 'Session started',
            session
        });
    } catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// End work session
app.post('/api/sessions/:sessionId/end', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { focusScore, pomodoroCount } = req.body;

        const session = await db.endWorkSession(
            parseInt(sessionId),
            focusScore || 0,
            pomodoroCount || 0
        );

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({
            message: 'Session ended',
            session
        });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

// Get user sessions
app.get('/api/sessions', authenticateToken, async (req, res) => {
    try {
        const { limit } = req.query;
        const sessions = await db.getUserSessions(
            req.user.userId,
            parseInt(limit) || 10
        );

        res.json({ sessions });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
});

// Get active session
app.get('/api/sessions/active', authenticateToken, async (req, res) => {
    try {
        const session = await db.getActiveSession(req.user.userId);
        res.json({ session: session || null });
    } catch (error) {
        console.error('Get active session error:', error);
        res.status(500).json({ error: 'Failed to get active session' });
    }
});

// ============================================
// EMOTION TRACKING ROUTES
// ============================================

// Save emotion data
app.post('/api/emotions', authenticateToken, async (req, res) => {
    try {
        const { sessionId, emotion, confidence, focusScore, metadata } = req.body;

        if (!sessionId || !emotion || confidence === undefined) {
            return res.status(400).json({ 
                error: 'Session ID, emotion, and confidence required' 
            });
        }

        // Round focusScore to integer for database INTEGER field
        const roundedFocusScore = Math.round(parseFloat(focusScore) || 0);

        const emotionData = await db.saveEmotion(
            req.user.userId,
            sessionId,
            emotion,
            confidence,
            roundedFocusScore,
            metadata || {}
        );

        res.status(201).json({
            message: 'Emotion saved',
            data: emotionData
        });
    } catch (error) {
        console.error('Save emotion error:', error);
        res.status(500).json({ error: 'Failed to save emotion' });
    }
});

// Get emotion history
app.get('/api/emotions', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, limit } = req.query;

        const history = await db.getEmotionHistory(
            req.user.userId,
            startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate || new Date().toISOString(),
            parseInt(limit) || 1000
        );

        res.json({ history });
    } catch (error) {
        console.error('Get emotion history error:', error);
        res.status(500).json({ error: 'Failed to get emotion history' });
    }
});

// Get emotion distribution
app.get('/api/emotions/distribution', authenticateToken, async (req, res) => {
    try {
        const { date } = req.query;
        const distribution = await db.getEmotionDistribution(
            req.user.userId,
            date || new Date().toISOString().split('T')[0]
        );

        res.json({ distribution });
    } catch (error) {
        console.error('Get emotion distribution error:', error);
        res.status(500).json({ error: 'Failed to get emotion distribution' });
    }
});

// ============================================
// PRODUCTIVITY STATS ROUTES
// ============================================

// Update daily stats
app.post('/api/stats/daily', authenticateToken, async (req, res) => {
    try {
        const { date, stats } = req.body;

        if (!date || !stats) {
            return res.status(400).json({ error: 'Date and stats required' });
        }

        const result = await db.upsertDailyStats(req.user.userId, date, stats);

        res.json({
            message: 'Stats updated',
            stats: result
        });
    } catch (error) {
        console.error('Update stats error:', error);
        res.status(500).json({ error: 'Failed to update stats' });
    }
});

// Get daily stats
app.get('/api/stats/daily', authenticateToken, async (req, res) => {
    try {
        const { date } = req.query;
        const stats = await db.getDailyStats(
            req.user.userId,
            date || new Date().toISOString().split('T')[0]
        );

        res.json({ stats: stats || null });
    } catch (error) {
        console.error('Get daily stats error:', error);
        res.status(500).json({ error: 'Failed to get daily stats' });
    }
});

// Get stats range
app.get('/api/stats/range', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const stats = await db.getStatsRange(
            req.user.userId,
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate || new Date().toISOString().split('T')[0]
        );

        res.json({ stats });
    } catch (error) {
        console.error('Get stats range error:', error);
        res.status(500).json({ error: 'Failed to get stats range' });
    }
});

// Get weekly stats
app.get('/api/stats/weekly', authenticateToken, async (req, res) => {
    try {
        const stats = await db.getWeeklyStats(req.user.userId);
        res.json({ stats });
    } catch (error) {
        console.error('Get weekly stats error:', error);
        res.status(500).json({ error: 'Failed to get weekly stats' });
    }
});

// ============================================
// WORK NOTES ROUTES
// ============================================

// Create note
app.post('/api/notes', authenticateToken, async (req, res) => {
    try {
        const { sessionId, noteText, emotion, focusScore, tags } = req.body;

        if (!noteText) {
            return res.status(400).json({ error: 'Note text required' });
        }

        const note = await db.createNote(
            req.user.userId,
            sessionId || null,
            noteText,
            emotion || null,
            focusScore || 0,
            tags || []
        );

        res.status(201).json({
            message: 'Note created',
            note
        });
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// Get user notes
app.get('/api/notes', authenticateToken, async (req, res) => {
    try {
        const { limit } = req.query;
        const notes = await db.getUserNotes(
            req.user.userId,
            parseInt(limit) || 50
        );

        res.json({ notes });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to get notes' });
    }
});

// Delete note
app.delete('/api/notes/:noteId', authenticateToken, async (req, res) => {
    try {
        const { noteId } = req.params;
        const result = await db.deleteNote(parseInt(noteId), req.user.userId);

        if (!result) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note deleted' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// ============================================
// DASHBOARD & ANALYTICS ROUTES
// ============================================

// Get dashboard summary
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const summary = await db.getDashboardSummary(req.user.userId);
        res.json({ dashboard: summary });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Failed to get dashboard data' });
    }
});

// ============================================
// EXPORT TRACKING ROUTES
// ============================================

// Log export
app.post('/api/exports', authenticateToken, async (req, res) => {
    try {
        const { exportType, dateRangeStart, dateRangeEnd, fileName } = req.body;

        const exportLog = await db.logExport(
            req.user.userId,
            exportType,
            dateRangeStart || null,
            dateRangeEnd || null,
            fileName || null
        );

        res.status(201).json({
            message: 'Export logged',
            export: exportLog
        });
    } catch (error) {
        console.error('Log export error:', error);
        res.status(500).json({ error: 'Failed to log export' });
    }
});

// Get export history
app.get('/api/exports', authenticateToken, async (req, res) => {
    try {
        const { limit } = req.query;
        const exports = await db.getExportHistory(
            req.user.userId,
            parseInt(limit) || 20
        );

        res.json({ exports });
    } catch (error) {
        console.error('Get exports error:', error);
        res.status(500).json({ error: 'Failed to get export history' });
    }
});

// ============================================
// HEALTH CHECK ROUTES
// ============================================

app.get('/api/health', async (req, res) => {
    try {
        const dbHealth = await db.healthCheck();
        res.json({
            status: 'ok',
            server: 'running',
            database: dbHealth
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            server: 'running',
            database: 'error',
            error: error.message
        });
    }
});

app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: TIMEZONE_UTILS.toISOStringGMT7() });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎭  EMOTION DETECTION & PRODUCTIVITY TRACKER API        ║
║                                                            ║
║   Server:    http://localhost:${PORT}                         ║
║   Health:    http://localhost:${PORT}/api/health              ║
║   Docs:      See README_API.md for endpoints              ║
║                                                            ║
║   Database:  Neon PostgreSQL (Serverless)                 ║
║   Status:    ✅ Ready                                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
