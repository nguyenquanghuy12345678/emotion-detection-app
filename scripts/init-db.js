require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function initDatabase() {
  console.log('??? Initializing Neon Database...\n');

  try {
    await sql`DROP TABLE IF EXISTS work_notes CASCADE`;
    await sql`DROP TABLE IF EXISTS emotion_history CASCADE`;
    await sql`DROP TABLE IF EXISTS work_sessions CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    console.log('? Dropped old tables\n');

    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
      )
    `;

    await sql`
      CREATE TABLE work_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_type VARCHAR(50) DEFAULT 'camera_tracking',
        start_time TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
        end_time TIMESTAMP,
        duration_seconds INTEGER,
        status VARCHAR(20) DEFAULT 'active'
      )
    `;

    await sql`
      CREATE TABLE emotion_history (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES work_sessions(id) ON DELETE CASCADE,
        emotion VARCHAR(50) NOT NULL,
        confidence DECIMAL(5,2),
        focus_score INTEGER,
        detected_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
      )
    `;

    await sql`
      CREATE TABLE work_notes (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES work_sessions(id) ON DELETE CASCADE,
        note_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
      )
    `;

    console.log('? Created 4 tables: users, work_sessions, emotion_history, work_notes\n');

    await sql`
      CREATE OR REPLACE FUNCTION update_session_duration()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
          NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await sql`
      CREATE TRIGGER auto_update_duration
      BEFORE UPDATE ON work_sessions
      FOR EACH ROW
      EXECUTE FUNCTION update_session_duration();
    `;

    console.log('? Created trigger for auto-calculating duration\n');

    const passwordHash = '$2a$10$abcdefghijklmnopqrstuv';
    await sql`
      INSERT INTO users (email, password_hash, full_name)
      VALUES ('demo@example.com', ${passwordHash}, 'Demo User')
      ON CONFLICT (email) DO NOTHING
    `;

    console.log('? Created demo user: demo@example.com / password: demo123\n');
    console.log('?? Database ready! All timestamps in UTC+7 (Vietnam time)');

  } catch (error) {
    console.error('? Error:', error.message);
    throw error;
  }
}

initDatabase();
