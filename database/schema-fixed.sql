-- ============================================
-- FIXED NEON DATABASE SCHEMA
-- Khớp 100% với code đang chạy
-- ============================================

-- Drop existing tables if needed (comment out in production)
-- DROP TABLE IF EXISTS export_history CASCADE;
-- DROP TABLE IF EXISTS absence_logs CASCADE;
-- DROP TABLE IF EXISTS alert_logs CASCADE;
-- DROP TABLE IF EXISTS work_notes CASCADE;
-- DROP TABLE IF EXISTS productivity_stats CASCADE;
-- DROP TABLE IF EXISTS emotion_history CASCADE;
-- DROP TABLE IF EXISTS work_sessions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- CORE TABLES
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Work sessions table
CREATE TABLE IF NOT EXISTS work_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    focus_score INTEGER DEFAULT 0, -- Changed to INTEGER to match code
    pomodoro_count INTEGER DEFAULT 0,
    session_type VARCHAR(50) DEFAULT 'work',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON work_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON work_sessions(session_type);

-- Emotion history table (FIXED column names)
CREATE TABLE IF NOT EXISTS emotion_history (
    emotion_id SERIAL PRIMARY KEY, -- Changed from 'id' to 'emotion_id'
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL REFERENCES work_sessions(id) ON DELETE CASCADE,
    emotion VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    focus_score INTEGER DEFAULT 0, -- Changed to INTEGER
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Changed from 'timestamp'
    CONSTRAINT valid_emotion CHECK (emotion IN ('happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted'))
);

CREATE INDEX IF NOT EXISTS idx_emotion_user ON emotion_history(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_session ON emotion_history(session_id);
CREATE INDEX IF NOT EXISTS idx_emotion_detected_at ON emotion_history(detected_at);
CREATE INDEX IF NOT EXISTS idx_emotion_type ON emotion_history(emotion);

-- Work notes table (FIXED to match productivity.js)
CREATE TABLE IF NOT EXISTS work_notes (
    note_id SERIAL PRIMARY KEY, -- Changed from 'id'
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE SET NULL,
    note_text TEXT NOT NULL,
    emotion VARCHAR(50),
    focus_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_notes_user ON work_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_session ON work_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_created ON work_notes(created_at);

-- Export history table
CREATE TABLE IF NOT EXISTS export_history (
    export_id SERIAL PRIMARY KEY, -- Changed from 'id'
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL,
    date_range_start DATE,
    date_range_end DATE,
    file_name VARCHAR(255),
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Changed from 'created_at'
    CONSTRAINT valid_export_type CHECK (export_type IN ('pdf', 'csv'))
);

CREATE INDEX IF NOT EXISTS idx_exports_user ON export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_created ON export_history(exported_at);

-- ============================================
-- OPTIONAL TABLES (chỉ tạo nếu có chức năng)
-- ============================================

-- Productivity stats table (cho daily aggregation - OPTIONAL)
CREATE TABLE IF NOT EXISTS productivity_stats (
    stats_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_work_time INTEGER DEFAULT 0,
    total_break_time INTEGER DEFAULT 0,
    focused_time INTEGER DEFAULT 0,
    distracted_time INTEGER DEFAULT 0,
    stress_time INTEGER DEFAULT 0,
    happy_time INTEGER DEFAULT 0,
    average_focus_score INTEGER DEFAULT 0, -- Changed to INTEGER
    pomodoro_completed INTEGER DEFAULT 0,
    emotions_distribution JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_stats_user ON productivity_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_stats_date ON productivity_stats(date);

-- Alert logs table (cho AI assistant alerts - OPTIONAL)
CREATE TABLE IF NOT EXISTS alert_logs (
    alert_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES work_sessions(id) ON DELETE SET NULL,
    alert_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'low',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high'))
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON alert_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alert_logs(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alert_logs(created_at);

-- Absence logs table (cho tracking vắng mặt - OPTIONAL)
CREATE TABLE IF NOT EXISTS absence_logs (
    absence_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL REFERENCES work_sessions(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_absence_user ON absence_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_absence_session ON absence_logs(session_id);

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

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stats_updated_at ON productivity_stats;
CREATE TRIGGER update_stats_updated_at 
    BEFORE UPDATE ON productivity_stats
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON work_notes;
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON work_notes
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION SCRIPT (nếu đã có data cũ)
-- ============================================

-- Nếu bảng emotion_history đã tồn tại với column 'timestamp', rename nó:
-- ALTER TABLE emotion_history RENAME COLUMN timestamp TO detected_at;
-- ALTER TABLE emotion_history RENAME COLUMN id TO emotion_id;

-- Nếu bảng export_history đã tồn tại:
-- ALTER TABLE export_history RENAME COLUMN created_at TO exported_at;
-- ALTER TABLE export_history RENAME COLUMN id TO export_id;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Demo user (password: demo123)
INSERT INTO users (email, password_hash, full_name, settings)
VALUES (
    'demo@emotiontracker.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Demo User',
    '{"theme": "light", "notifications": true}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFY TABLES
-- ============================================

-- Query để kiểm tra tất cả tables đã tạo
SELECT 
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Query để xem columns của emotion_history
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'emotion_history'
ORDER BY ordinal_position;

COMMENT ON TABLE users IS 'User accounts';
COMMENT ON TABLE work_sessions IS 'Work sessions with start/end times';
COMMENT ON TABLE emotion_history IS 'Detected emotions during sessions';
COMMENT ON TABLE work_notes IS 'User notes during work';
COMMENT ON TABLE export_history IS 'PDF/CSV export logs';
COMMENT ON TABLE productivity_stats IS 'Daily aggregated stats (optional)';
COMMENT ON TABLE alert_logs IS 'System alerts (optional)';
COMMENT ON TABLE absence_logs IS 'Away from desk tracking (optional)';
