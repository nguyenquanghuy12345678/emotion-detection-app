-- ============================================
-- NEON DATABASE SCHEMA FOR EMOTION TRACKER
-- Production-ready PostgreSQL schema
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
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

-- Create index for faster email lookup
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Work sessions table
CREATE TABLE IF NOT EXISTS work_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    focus_score DECIMAL(5,2) DEFAULT 0,
    pomodoro_count INTEGER DEFAULT 0,
    session_type VARCHAR(50) DEFAULT 'work', -- 'work', 'break', 'pomodoro'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON work_sessions(user_id);
CREATE INDEX idx_sessions_start_time ON work_sessions(start_time);

-- Emotion history table
CREATE TABLE IF NOT EXISTS emotion_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE CASCADE,
    emotion VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    focus_score INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_emotion_user ON emotion_history(user_id);
CREATE INDEX idx_emotion_session ON emotion_history(session_id);
CREATE INDEX idx_emotion_timestamp ON emotion_history(timestamp);
CREATE INDEX idx_emotion_type ON emotion_history(emotion);

-- Productivity stats table (aggregated daily stats)
CREATE TABLE IF NOT EXISTS productivity_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_work_time INTEGER DEFAULT 0, -- seconds
    total_break_time INTEGER DEFAULT 0, -- seconds
    focused_time INTEGER DEFAULT 0, -- seconds
    distracted_time INTEGER DEFAULT 0, -- seconds
    stress_time INTEGER DEFAULT 0, -- seconds
    happy_time INTEGER DEFAULT 0, -- seconds
    average_focus_score DECIMAL(5,2) DEFAULT 0,
    pomodoro_completed INTEGER DEFAULT 0,
    emotions_distribution JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

CREATE INDEX idx_stats_user ON productivity_stats(user_id);
CREATE INDEX idx_stats_date ON productivity_stats(date);

-- Work notes table
CREATE TABLE IF NOT EXISTS work_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

-- Alerts/Notifications log
CREATE TABLE IF NOT EXISTS alert_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE SET NULL,
    alert_type VARCHAR(100) NOT NULL, -- 'stress', 'break_needed', 'absence', etc.
    priority VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_user ON alert_logs(user_id);
CREATE INDEX idx_alerts_read ON alert_logs(is_read);
CREATE INDEX idx_alerts_created ON alert_logs(created_at);

-- Absence tracking
CREATE TABLE IF NOT EXISTS absence_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    reason VARCHAR(100), -- 'lunch', 'break', 'meeting', 'unknown'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_absence_user ON absence_logs(user_id);
CREATE INDEX idx_absence_session ON absence_logs(session_id);

-- Export history (track PDF/CSV exports)
CREATE TABLE IF NOT EXISTS export_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL, -- 'pdf', 'csv'
    date_range_start DATE,
    date_range_end DATE,
    file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exports_user ON export_history(user_id);
CREATE INDEX idx_exports_created ON export_history(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON productivity_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON work_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Daily productivity summary view
CREATE OR REPLACE VIEW v_daily_productivity AS
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    ps.date,
    ps.total_work_time,
    ps.focused_time,
    ps.average_focus_score,
    ps.pomodoro_completed,
    ps.emotions_distribution,
    CASE 
        WHEN ps.total_work_time > 0 
        THEN ROUND((ps.focused_time::DECIMAL / ps.total_work_time::DECIMAL) * 100, 2)
        ELSE 0
    END as focus_percentage
FROM users u
LEFT JOIN productivity_stats ps ON u.id = ps.user_id
WHERE u.is_active = true
ORDER BY ps.date DESC;

-- Weekly productivity summary view
CREATE OR REPLACE VIEW v_weekly_productivity AS
SELECT 
    user_id,
    DATE_TRUNC('week', date) as week_start,
    SUM(total_work_time) as total_work_time,
    SUM(focused_time) as focused_time,
    AVG(average_focus_score) as avg_focus_score,
    SUM(pomodoro_completed) as total_pomodoros,
    COUNT(*) as days_worked
FROM productivity_stats
GROUP BY user_id, DATE_TRUNC('week', date)
ORDER BY week_start DESC;

-- Emotion distribution view
CREATE OR REPLACE VIEW v_emotion_distribution AS
SELECT 
    user_id,
    emotion,
    COUNT(*) as count,
    AVG(confidence) as avg_confidence,
    DATE(timestamp) as date
FROM emotion_history
GROUP BY user_id, emotion, DATE(timestamp)
ORDER BY date DESC, count DESC;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert a demo user (password: demo123)
-- Password hash for 'demo123' using bcryptjs with 10 rounds
INSERT INTO users (email, password_hash, full_name, settings)
VALUES (
    'demo@emotiontracker.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Demo User',
    '{"theme": "light", "notifications": true}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE work_sessions IS 'Tracks individual work sessions';
COMMENT ON TABLE emotion_history IS 'Real-time emotion detection data';
COMMENT ON TABLE productivity_stats IS 'Daily aggregated productivity statistics';
COMMENT ON TABLE work_notes IS 'User notes during work sessions';
COMMENT ON TABLE alert_logs IS 'System alerts and notifications';
COMMENT ON TABLE absence_logs IS 'Tracks when user is away from desk';
COMMENT ON TABLE export_history IS 'Logs of exported reports';
