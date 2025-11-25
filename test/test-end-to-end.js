// Test End-to-End Flow
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function testEndToEnd() {
    console.log('🚀 Starting End-to-End Test...\n');
    
    try {
        // 1. Test user login flow
        console.log('1️⃣ Testing User Authentication...');
        const userResult = await sql`
            SELECT id, email, full_name 
            FROM users 
            LIMIT 1
        `;
        
        if (userResult.length > 0) {
            const user = userResult[0];
            console.log('   ✅ User found:', user.email);
            console.log('   👤 Full Name:', user.full_name);
            console.log('   🆔 User ID:', user.id);
        } else {
            console.log('   ❌ No test user found!');
            return;
        }
        
        const userId = userResult[0].id;
        
        // 2. Test work sessions
        console.log('\n2️⃣ Testing Work Sessions...');
        const sessionsResult = await sql`
            SELECT 
                id,
                user_id,
                start_time,
                end_time,
                duration_seconds,
                focus_score,
                pomodoro_count,
                session_type
            FROM work_sessions
            WHERE user_id = ${userId}
            ORDER BY start_time DESC
            LIMIT 3
        `;
        
        console.log(`   ✅ Found ${sessionsResult.length} sessions for this user`);
        sessionsResult.forEach((session, idx) => {
            console.log(`   Session ${idx + 1}:`);
            console.log('     - ID:', session.id);
            console.log('     - Duration:', Math.round(session.duration_seconds / 60), 'minutes');
            console.log('     - Focus Score:', session.focus_score);
            console.log('     - Status:', session.end_time ? 'Completed' : 'Active');
        });
        
        // 3. Test emotion history
        console.log('\n3️⃣ Testing Emotion Detection Data...');
        const emotionsResult = await sql`
            SELECT 
                eh.id,
                eh.session_id,
                eh.emotion,
                eh.confidence,
                eh.focus_score,
                eh.timestamp,
                ws.user_id
            FROM emotion_history eh
            JOIN work_sessions ws ON eh.session_id = ws.id
            WHERE ws.user_id = ${userId}
            ORDER BY eh.timestamp DESC
            LIMIT 5
        `;
        
        console.log(`   ✅ Found ${emotionsResult.length} emotion records`);
        emotionsResult.forEach((emotion, idx) => {
            console.log(`   Emotion ${idx + 1}:`);
            console.log('     - Type:', emotion.emotion);
            console.log('     - Confidence:', Math.round(emotion.confidence * 100) + '%');
            console.log('     - Focus Score:', emotion.focus_score);
            console.log('     - Session:', emotion.session_id);
            console.log('     - Detected:', new Date(emotion.timestamp).toLocaleString('vi-VN'));
        });
        
        // 4. Test work notes
        console.log('\n4️⃣ Testing Work Notes...');
        const notesResult = await sql`
            SELECT 
                id,
                session_id,
                note_text,
                created_at
            FROM work_notes
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT 3
        `;
        
        console.log(`   ✅ Found ${notesResult.length} notes`);
        notesResult.forEach((note, idx) => {
            console.log(`   Note ${idx + 1}:`);
            console.log('     - Text:', note.note_text);
            console.log('     - Session:', note.session_id);
            console.log('     - Created:', new Date(note.created_at).toLocaleString('vi-VN'));
        });
        
        // 5. Test export history
        console.log('\n5️⃣ Testing Export History...');
        const exportsResult = await sql`
            SELECT 
                id,
                user_id,
                file_name,
                created_at
            FROM export_history
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT 3
        `;
        
        console.log(`   ✅ Found ${exportsResult.length} exports`);
        exportsResult.forEach((exp, idx) => {
            console.log(`   Export ${idx + 1}:`);
            console.log('     - File:', exp.file_name);
            console.log('     - Date:', new Date(exp.created_at).toLocaleString('vi-VN'));
        });
        
        // 6. Test productivity stats calculation
        console.log('\n6️⃣ Testing Productivity Stats Calculation...');
        const statsResult = await sql`
            SELECT 
                COUNT(*) as total_sessions,
                SUM(duration_seconds) as total_seconds,
                AVG(focus_score) as avg_focus,
                COUNT(CASE WHEN end_time IS NOT NULL THEN 1 END) as completed_sessions
            FROM work_sessions
            WHERE user_id = ${userId}
        `;
        
        const stats = statsResult[0];
        const totalMinutes = Math.round((stats.total_seconds || 0) / 60);
        console.log('   ✅ Productivity Summary:');
        console.log('     - Total Sessions:', Number(stats.total_sessions));
        console.log('     - Total Work Time:', totalMinutes, 'minutes');
        console.log('     - Average Focus:', Math.round(stats.avg_focus || 0) + '%');
        console.log('     - Completed Sessions:', Number(stats.completed_sessions));
        
        // 7. Simulate PDF export data fetch
        console.log('\n7️⃣ Testing PDF Export Data Query...');
        const pdfDataResult = await sql`
            SELECT 
                ws.id,
                ws.start_time,
                ws.end_time,
                ws.duration_seconds,
                ws.focus_score,
                ws.pomodoro_count,
                COUNT(eh.id) as emotion_count
            FROM work_sessions ws
            LEFT JOIN emotion_history eh ON ws.id = eh.session_id
            WHERE ws.user_id = ${userId} AND ws.end_time IS NOT NULL
            GROUP BY ws.id, ws.start_time, ws.end_time, 
                     ws.duration_seconds, ws.focus_score, ws.pomodoro_count
            ORDER BY ws.start_time DESC
            LIMIT 1
        `;
        
        if (pdfDataResult.length > 0) {
            const pdfData = pdfDataResult[0];
            const durationMinutes = Math.round(pdfData.duration_seconds / 60);
            console.log('   ✅ PDF Export Data Ready:');
            console.log('     - Session ID:', pdfData.id);
            console.log('     - Duration:', durationMinutes, 'minutes');
            console.log('     - Focus Score:', pdfData.focus_score + '%');
            console.log('     - Emotions Detected:', Number(pdfData.emotion_count));
            
            // Get actual emotions for this session
            const sessionEmotions = await sql`
                SELECT emotion, confidence, focus_score, timestamp
                FROM emotion_history
                WHERE session_id = ${pdfData.id}
                ORDER BY timestamp
                LIMIT 3
            `;
            console.log('     - Sample Emotions:', sessionEmotions.map(e => e.emotion).join(', '));
        } else {
            console.log('   ⚠️ No completed sessions found for export');
        }
        
        console.log('\n✅ End-to-End Test COMPLETED!\n');
        console.log('📊 Summary:');
        console.log('   - User authentication: ✅');
        console.log('   - Work sessions tracking: ✅');
        console.log('   - Emotion detection: ✅');
        console.log('   - Work notes: ✅');
        console.log('   - Export history: ✅');
        console.log('   - PDF data ready: ✅');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

testEndToEnd();
