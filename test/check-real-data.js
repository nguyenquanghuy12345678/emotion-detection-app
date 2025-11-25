const {neon} = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkRealData() {
    console.log('🔍 Checking REAL data in database...\n');
    
    try {
        // Check users
        const users = await sql`SELECT COUNT(*)::int as count FROM users`;
        console.log(`👥 Users: ${users[0].count}`);
        
        if (users[0].count > 0) {
            const userList = await sql`SELECT id, email, full_name, created_at FROM users`;
            userList.forEach(u => {
                console.log(`   - [${u.id}] ${u.email} (${u.full_name})`);
            });
        }
        
        // Check sessions
        const sessions = await sql`SELECT COUNT(*)::int as count FROM work_sessions`;
        console.log(`\n📅 Work Sessions: ${sessions[0].count}`);
        
        if (sessions[0].count > 0) {
            const sessionList = await sql`
                SELECT id, user_id, start_time, end_time, duration_seconds, focus_score
                FROM work_sessions 
                ORDER BY start_time DESC 
                LIMIT 5
            `;
            sessionList.forEach(s => {
                const duration = s.duration_seconds ? `${Math.floor(s.duration_seconds / 60)}m ${s.duration_seconds % 60}s` : 'Running';
                const status = s.end_time ? '✅ Ended' : '🔄 Active';
                console.log(`   - [${s.id}] User ${s.user_id} | ${duration} | Focus ${s.focus_score}% | ${status}`);
            });
        }
        
        // Check emotions
        const emotions = await sql`SELECT COUNT(*)::int as count FROM emotion_history`;
        console.log(`\n😊 Emotion Records: ${emotions[0].count}`);
        
        if (emotions[0].count > 0) {
            const emotionList = await sql`
                SELECT id, session_id, emotion, confidence, focus_score, timestamp
                FROM emotion_history 
                ORDER BY timestamp DESC 
                LIMIT 10
            `;
            emotionList.forEach(e => {
                const time = new Date(e.timestamp).toLocaleTimeString('vi-VN');
                console.log(`   - [${e.id}] Session ${e.session_id} | ${e.emotion} (${Math.round(e.confidence * 100)}%) | Focus ${e.focus_score}% | ${time}`);
            });
        }
        
        // Check notes
        const notes = await sql`SELECT COUNT(*)::int as count FROM work_notes`;
        console.log(`\n📝 Notes: ${notes[0].count}`);
        
        if (notes[0].count > 0) {
            const noteList = await sql`
                SELECT id, session_id, note_text, created_at
                FROM work_notes 
                ORDER BY created_at DESC 
                LIMIT 5
            `;
            noteList.forEach(n => {
                const time = new Date(n.created_at).toLocaleTimeString('vi-VN');
                console.log(`   - [${n.id}] Session ${n.session_id} | "${n.note_text.substring(0, 50)}..." | ${time}`);
            });
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 DATA SUMMARY:');
        console.log('='.repeat(60));
        console.log(`Users:    ${users[0].count}`);
        console.log(`Sessions: ${sessions[0].count}`);
        console.log(`Emotions: ${emotions[0].count}`);
        console.log(`Notes:    ${notes[0].count}`);
        console.log('='.repeat(60));
        
        if (sessions[0].count === 0 && emotions[0].count === 0) {
            console.log('\n⚠️  WARNING: NO DATA YET!');
            console.log('Database is empty. You need to:');
            console.log('1. Open http://localhost:3000');
            console.log('2. Login with demo@emotiontracker.com / demo123');
            console.log('3. Start a work session');
            console.log('4. Let it run for 1-2 minutes to collect data');
            console.log('5. End the session');
            console.log('6. Then export PDF will have REAL data!\n');
        } else {
            console.log('\n✅ Database has REAL data!');
            console.log(`   - ${sessions[0].count} sessions tracked`);
            console.log(`   - ${emotions[0].count} emotions detected`);
            console.log('   - Ready for PDF export!\n');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkRealData();
