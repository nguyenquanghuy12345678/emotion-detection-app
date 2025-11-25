#!/usr/bin/env node

/**
 * INIT DATABASE - Simple Direct Execution
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function init() {
    console.log('🚀 Creating database schema...\n');
    
    try {
        // 1. Drop existing tables
        console.log('🗑️  Dropping existing tables...');
        await sql`DROP TABLE IF EXISTS absence_logs CASCADE`;
        await sql`DROP TABLE IF EXISTS alert_logs CASCADE`;
        await sql`DROP TABLE IF EXISTS export_history CASCADE`;
        await sql`DROP TABLE IF EXISTS work_notes CASCADE`;
        await sql`DROP TABLE IF EXISTS emotion_history CASCADE`;
        await sql`DROP TABLE IF EXISTS productivity_stats CASCADE`;
        await sql`DROP TABLE IF EXISTS work_sessions CASCADE`;
        await sql`DROP TABLE IF EXISTS users CASCADE`;
        console.log('✅ Dropped all tables\n');
        
        // 2. Create USERS table
        console.log('📝 Creating users table...');
        await sql`
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
            )
        `;
        await sql`CREATE INDEX idx_users_email ON users(email)`;
        console.log('✅ Users table created\n');
        
        // 3. Create WORK_SESSIONS table
        console.log('📝 Creating work_sessions table...');
        await sql`
            CREATE TABLE work_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                duration_seconds INTEGER DEFAULT 0,
                focus_score INTEGER DEFAULT 0,
                pomodoro_count INTEGER DEFAULT 0,
                session_type VARCHAR(50) DEFAULT 'work',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await sql`CREATE INDEX idx_sessions_user ON work_sessions(user_id)`;
        await sql`CREATE INDEX idx_sessions_start ON work_sessions(start_time)`;
        console.log('✅ Work_sessions table created\n');
        
        // 4. Create EMOTION_HISTORY table
        console.log('📝 Creating emotion_history table...');
        await sql`
            CREATE TABLE emotion_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                session_id INTEGER REFERENCES work_sessions(id) ON DELETE CASCADE,
                emotion VARCHAR(50) NOT NULL,
                confidence NUMERIC(5,4) DEFAULT 0,
                focus_score INTEGER DEFAULT 0,
                timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await sql`CREATE INDEX idx_emotions_user ON emotion_history(user_id)`;
        await sql`CREATE INDEX idx_emotions_session ON emotion_history(session_id)`;
        await sql`CREATE INDEX idx_emotions_time ON emotion_history(timestamp)`;
        console.log('✅ Emotion_history table created\n');
        
        // 5. Create WORK_NOTES table
        console.log('📝 Creating work_notes table...');
        await sql`
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
            )
        `;
        await sql`CREATE INDEX idx_notes_user ON work_notes(user_id)`;
        await sql`CREATE INDEX idx_notes_session ON work_notes(session_id)`;
        console.log('✅ Work_notes table created\n');
        
        // 6. Create PRODUCTIVITY_STATS table
        console.log('📝 Creating productivity_stats table...');
        await sql`
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
            )
        `;
        await sql`CREATE INDEX idx_stats_user ON productivity_stats(user_id)`;
        await sql`CREATE INDEX idx_stats_date ON productivity_stats(date)`;
        console.log('✅ Productivity_stats table created\n');
        
        // 7. Create EXPORT_HISTORY table
        console.log('📝 Creating export_history table...');
        await sql`
            CREATE TABLE export_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                export_type VARCHAR(10) NOT NULL,
                date_range_start DATE,
                date_range_end DATE,
                file_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await sql`CREATE INDEX idx_exports_user ON export_history(user_id)`;
        console.log('✅ Export_history table created\n');
        
        // 8. Create ALERT_LOGS table
        console.log('📝 Creating alert_logs table...');
        await sql`
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
            )
        `;
        await sql`CREATE INDEX idx_alerts_user ON alert_logs(user_id)`;
        console.log('✅ Alert_logs table created\n');
        
        // 9. Create ABSENCE_LOGS table
        console.log('📝 Creating absence_logs table...');
        await sql`
            CREATE TABLE absence_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                session_id INTEGER REFERENCES work_sessions(id) ON DELETE CASCADE,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                duration_seconds INTEGER,
                reason VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await sql`CREATE INDEX idx_absence_user ON absence_logs(user_id)`;
        console.log('✅ Absence_logs table created\n');
        
        // 10. Insert demo user
        console.log('👤 Creating demo user...');
        await sql`
            INSERT INTO users (email, password_hash, full_name, is_active)
            VALUES (
                'demo@emotiontracker.com',
                '$2a$10$rOZJKKNGF4wGx.iYkKLHC.J/nFqJHxYJxLTxQXmXK4qXVHxH4y7Ga',
                'Demo User',
                true
            )
        `;
        console.log('✅ Demo user created\n');
        
        // Verify
        console.log('🔍 Verifying installation...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `;
        
        console.log(`\n✅ Created ${tables.length} tables:`);
        tables.forEach(t => console.log(`   - ${t.table_name}`));
        
        const users = await sql`SELECT id, email, full_name FROM users`;
        console.log(`\n👥 Users: ${users.length}`);
        users.forEach(u => console.log(`   - ${u.email} (${u.full_name})`));
        
        console.log('\n🎉 Database initialization complete!');
        console.log('\n📌 Demo Login:');
        console.log('   Email: demo@emotiontracker.com');
        console.log('   Password: demo123\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    }
}

init().catch(console.error);
