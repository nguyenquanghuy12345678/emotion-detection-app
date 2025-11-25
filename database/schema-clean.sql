-- ============================================
-- CLEAN DATABASE SCHEMA
-- Emotion Detection & Productivity Tracker
-- Version: 2.0 - Production Ready
-- ============================================

-- Drop existing tables if any
DROP TABLE IF EXISTS absence_logs CASCADE;
DROP TABLE IF EXISTS alert_logs CASCADE;
DROP TABLE IF EXISTS export_history CASCADE;
DROP TABLE IF EXISTS work_notes CASCADE;
DROP TABLE IF EXISTS emotion_history CASCADE;
DROP TABLE IF EXISTS productivity_stats CASCADE;
DROP TABLE IF EXISTS work_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================
-- WORK SESSIONS TABLE
-- ============================================
CREATE TABLE work_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    focus_score INTEGER DEFAULT 0 CHECK (focus_score >= 0 AND focus_score <= 100),
    pomodoro_count INTEGER DEFAULT 0,
    session_type VARCHAR(50) DEFAULT 'work',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON work_sessions(user_id);
CREATE INDEX idx_sessions_start ON work_sessions(start_time);
CREATE INDEX idx_sessions_active ON work_sessions(user_id, end_time) WHERE end_time IS NULL;

-- ============================================
-- EMOTION HISTORY TABLE
-- ============================================
CREATE TABLE emotion_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE CASCADE,
    emotion VARCHAR(50) NOT NULL,
    confidence NUMERIC(5,4) DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
    focus_score INTEGER DEFAULT 0 CHECK (focus_score >= 0 AND focus_score <= 100),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emotions_user ON emotion_history(user_id);
CREATE INDEX idx_emotions_session ON emotion_history(session_id);
CREATE INDEX idx_emotions_time ON emotion_history(timestamp);
CREATE INDEX idx_emotions_type ON emotion_history(emotion);

-- ============================================
-- WORK NOTES TABLE
-- ============================================
CREATE TABLE work_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE SET NULL,
    note_text TEXT NOT NULL,
    emotion VARCHAR(50),
    focus_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[]
);

CREATE INDEX idx_notes_user ON work_notes(user_id);
CREATE INDEX idx_notes_session ON work_notes(session_id);
CREATE INDEX idx_notes_created ON work_notes(created_at);

-- ============================================
-- PRODUCTIVITY STATS TABLE
-- ============================================
CREATE TABLE productivity_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_work_time INTEGER DEFAULT 0,
    total_break_time INTEGER DEFAULT 0,
    focused_time INTEGER DEFAULT 0,
    distracted_time INTEGER DEFAULT 0,
    stress_time INTEGER DEFAULT 0,
    happy_time INTEGER DEFAULT 0,
    average_focus_score INTEGER DEFAULT 0,
    pomodoro_completed INTEGER DEFAULT 0,
    emotions_distribution JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

CREATE INDEX idx_stats_user ON productivity_stats(user_id);
CREATE INDEX idx_stats_date ON productivity_stats(date);

-- ============================================
-- EXPORT HISTORY TABLE
-- ============================================
CREATE TABLE export_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(10) NOT NULL CHECK (export_type IN ('pdf', 'csv', 'json')),
    date_range_start DATE,
    date_range_end DATE,
    file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exports_user ON export_history(user_id);
CREATE INDEX idx_exports_created ON export_history(created_at);

-- ============================================
-- ALERT LOGS TABLE
-- ============================================
CREATE TABLE alert_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'low',
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_user ON alert_logs(user_id);
CREATE INDEX idx_alerts_read ON alert_logs(is_read);
CREATE INDEX idx_alerts_created ON alert_logs(created_at);

-- ============================================
-- ABSENCE LOGS TABLE
-- ============================================
CREATE TABLE absence_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds INTEGER,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_absence_user ON absence_logs(user_id);
CREATE INDEX idx_absence_session ON absence_logs(session_id);
CREATE INDEX idx_absence_time ON absence_logs(start_time);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Daily productivity summary view
CREATE OR REPLACE VIEW daily_productivity AS
SELECT 
    u.id as user_id,
    u.full_name,
    DATE(ws.start_time) as work_date,
    COUNT(DISTINCT ws.id) as total_sessions,
    COALESCE(SUM(ws.duration_seconds), 0) as total_work_seconds,
    COALESCE(AVG(ws.focus_score), 0) as avg_focus_score,
    COALESCE(SUM(ws.pomodoro_count), 0) as total_pomodoros,
    COUNT(DISTINCT eh.id) as total_emotions,
    COUNT(DISTINCT wn.id) as total_notes
FROM users u
LEFT JOIN work_sessions ws ON u.id = ws.user_id
LEFT JOIN emotion_history eh ON ws.id = eh.session_id
LEFT JOIN work_notes wn ON ws.id = wn.session_id
GROUP BY u.id, u.full_name, DATE(ws.start_time);

-- User productivity overview
CREATE OR REPLACE VIEW user_overview AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.created_at,
    u.last_login,
    COUNT(DISTINCT ws.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN ws.end_time IS NOT NULL THEN ws.id END) as completed_sessions,
    COALESCE(SUM(ws.duration_seconds), 0) as total_work_seconds,
    COALESCE(AVG(ws.focus_score), 0) as avg_focus_score,
    COUNT(DISTINCT eh.id) as total_emotions,
    COUNT(DISTINCT wn.id) as total_notes,
    COUNT(DISTINCT ex.id) as total_exports
FROM users u
LEFT JOIN work_sessions ws ON u.id = ws.user_id
LEFT JOIN emotion_history eh ON u.id = eh.user_id
LEFT JOIN work_notes wn ON u.id = wn.user_id
LEFT JOIN export_history ex ON u.id = ex.user_id
GROUP BY u.id, u.email, u.full_name, u.created_at, u.last_login;

-- Emotion distribution view
CREATE OR REPLACE VIEW emotion_distribution AS
SELECT 
    user_id,
    emotion,
    COUNT(*) as count,
    AVG(confidence) as avg_confidence,
    AVG(focus_score) as avg_focus,
    DATE(timestamp) as emotion_date
FROM emotion_history
GROUP BY user_id, emotion, DATE(timestamp);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update session duration when ended
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_duration
BEFORE UPDATE ON work_sessions
FOR EACH ROW
EXECUTE FUNCTION update_session_duration();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_notes_updated_at
BEFORE UPDATE ON work_notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_stats_updated_at
BEFORE UPDATE ON productivity_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA (Optional Demo User)
-- ============================================

-- Demo user with hashed password "demo123"
-- Password hash: $2a$10$YourHashHere (will be generated by bcrypt)
INSERT INTO users (email, password_hash, full_name, is_active)
VALUES (
    'demo@emotiontracker.com',
    '$2a$10$rOZJKKNGF4wGx.iYkKLHC.J/nFqJHxYJxLTxQXmXK4qXVHxH4y7Ga',
    'Demo User',
    true
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- GRANTS (for production)
-- ============================================

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
