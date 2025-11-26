-- ============================================
-- REALTIME CAMERA TRACKING SCHEMA
-- Emotion Detection - Camera Only Mode
-- Version: 3.0 - Vietnam Timezone (UTC+7)
-- ============================================

-- Drop existing tables
DROP TABLE IF EXISTS work_notes CASCADE;
DROP TABLE IF EXISTS emotion_history CASCADE;
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
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
    updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================
-- WORK SESSIONS TABLE
-- Real-time tracking - Auto start when face detected
-- ============================================
CREATE TABLE work_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
    end_time TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    focus_score INTEGER DEFAULT 0 CHECK (focus_score >= 0 AND focus_score <= 100),
    session_type VARCHAR(50) DEFAULT 'camera_tracking',
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
);

CREATE INDEX idx_sessions_user ON work_sessions(user_id);
CREATE INDEX idx_sessions_start ON work_sessions(start_time);
CREATE INDEX idx_sessions_active ON work_sessions(user_id, end_time) WHERE end_time IS NULL;

-- ============================================
-- EMOTION HISTORY TABLE  
-- Real-time emotion tracking from camera
-- ============================================
CREATE TABLE emotion_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE CASCADE,
    emotion VARCHAR(50) NOT NULL,
    confidence NUMERIC(5,4) DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
    focus_score INTEGER DEFAULT 0 CHECK (focus_score >= 0 AND focus_score <= 100),
    timestamp TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
);

CREATE INDEX idx_emotions_user ON emotion_history(user_id);
CREATE INDEX idx_emotions_session ON emotion_history(session_id);
CREATE INDEX idx_emotions_time ON emotion_history(timestamp);
CREATE INDEX idx_emotions_type ON emotion_history(emotion);

-- ============================================
-- WORK NOTES TABLE
-- Optional notes during sessions
-- ============================================
CREATE TABLE work_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE SET NULL,
    note_text TEXT NOT NULL,
    emotion VARCHAR(50),
    focus_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
    updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
);

CREATE INDEX idx_notes_user ON work_notes(user_id);
CREATE INDEX idx_notes_session ON work_notes(session_id);
CREATE INDEX idx_notes_created ON work_notes(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto calculate session duration when ended
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $function$
BEGIN
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    END IF;
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_duration
BEFORE UPDATE ON work_sessions
FOR EACH ROW
EXECUTE FUNCTION update_session_duration();

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $function$
BEGIN
    NEW.updated_at = (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh');
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_notes_updated_at
BEFORE UPDATE ON work_notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Daily summary view (Vietnam timezone)
CREATE OR REPLACE VIEW daily_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    DATE(ws.start_time AT TIME ZONE 'Asia/Ho_Chi_Minh') as work_date,
    COUNT(DISTINCT ws.id) as total_sessions,
    COALESCE(SUM(ws.duration_seconds), 0) as total_work_seconds,
    COALESCE(AVG(ws.focus_score), 0) as avg_focus_score,
    COUNT(DISTINCT eh.id) as total_emotions,
    COUNT(DISTINCT wn.id) as total_notes
FROM users u
LEFT JOIN work_sessions ws ON u.id = ws.user_id
LEFT JOIN emotion_history eh ON ws.id = eh.session_id
LEFT JOIN work_notes wn ON ws.id = wn.session_id
GROUP BY u.id, u.full_name, DATE(ws.start_time AT TIME ZONE 'Asia/Ho_Chi_Minh');

-- Emotion distribution view
CREATE OR REPLACE VIEW emotion_distribution AS
SELECT 
    user_id,
    emotion,
    COUNT(*) as count,
    AVG(confidence) as avg_confidence,
    AVG(focus_score) as avg_focus,
    DATE(timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') as emotion_date
FROM emotion_history
GROUP BY user_id, emotion, DATE(timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh');

-- ============================================
-- DEMO USER
-- ============================================
INSERT INTO users (email, password_hash, full_name, is_active)
VALUES (
    'demo@emotiontracker.com',
    '$2a$10$rOZJKKNGF4wGx.iYkKLHC.J/nFqJHxYJxLTxQXmXK4qXVHxH4y7Ga',
    'Demo User',
    true
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- All timestamps use Vietnam timezone (UTC+7)
-- Camera auto-starts session when face detected
-- Session ends only after user confirmation
-- No export functionality - data stays in Neon database
