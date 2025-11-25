#!/usr/bin/env node

/**
 * Test Data Flow - Verify database and export functionality
 * Run after starting a session and detecting emotions
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Data Flow...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    console.log('💡 Create .env with DATABASE_URL and JWT_SECRET');
    process.exit(1);
}

console.log('✅ .env file exists\n');

// Load environment variables
require('dotenv').config();

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env');
    process.exit(1);
}

console.log('✅ DATABASE_URL configured\n');

// Test database connection
async function testDatabase() {
    console.log('📊 Testing database connection...\n');
    
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    try {
        // Test 1: Check tables exist
        console.log('1️⃣ Checking tables...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `;
        
        const requiredTables = [
            'users',
            'work_sessions',
            'emotion_history',
            'productivity_stats',
            'work_notes',
            'alert_logs',
            'absence_logs',
            'export_history'
        ];
        
        const existingTables = tables.map(t => t.table_name);
        
        requiredTables.forEach(tableName => {
            if (existingTables.includes(tableName)) {
                console.log(`   ✅ ${tableName}`);
            } else {
                console.log(`   ❌ ${tableName} - MISSING`);
            }
        });
        
        console.log('');
        
        // Test 2: Check data counts
        console.log('2️⃣ Checking data counts...');
        
        const userCount = await sql`SELECT COUNT(*) as count FROM users`;
        console.log(`   Users: ${userCount[0].count}`);
        
        const sessionCount = await sql`SELECT COUNT(*) as count FROM work_sessions`;
        console.log(`   Work Sessions: ${sessionCount[0].count}`);
        
        const emotionCount = await sql`SELECT COUNT(*) as count FROM emotion_history`;
        console.log(`   Emotions: ${emotionCount[0].count}`);
        
        const noteCount = await sql`SELECT COUNT(*) as count FROM work_notes`;
        console.log(`   Notes: ${noteCount[0].count}`);
        
        const exportCount = await sql`SELECT COUNT(*) as count FROM export_history`;
        console.log(`   Exports: ${exportCount[0].count}`);
        
        console.log('');
        
        // Test 3: Check recent data
        if (emotionCount[0].count > 0) {
            console.log('3️⃣ Recent emotions...');
            const recentEmotions = await sql`
                SELECT 
                    e.emotion_id,
                    e.user_id,
                    e.session_id,
                    e.emotion,
                    e.confidence,
                    e.focus_score,
                    e.detected_at,
                    u.full_name
                FROM emotion_history e
                JOIN users u ON e.user_id = u.id
                ORDER BY e.detected_at DESC
                LIMIT 5
            `;
            
            recentEmotions.forEach((e, i) => {
                console.log(`   ${i + 1}. ${e.full_name} - ${e.emotion} (${Math.round(e.confidence * 100)}%) - Session ${e.session_id} - Focus: ${e.focus_score}`);
            });
            console.log('');
        }
        
        // Test 4: Check sessions
        if (sessionCount[0].count > 0) {
            console.log('4️⃣ Recent sessions...');
            const recentSessions = await sql`
                SELECT 
                    s.id,
                    s.user_id,
                    s.session_type,
                    s.start_time,
                    s.end_time,
                    s.duration_seconds,
                    s.focus_score,
                    u.full_name
                FROM work_sessions s
                JOIN users u ON s.user_id = u.id
                ORDER BY s.start_time DESC
                LIMIT 5
            `;
            
            recentSessions.forEach((s, i) => {
                const duration = s.duration_seconds 
                    ? `${Math.floor(s.duration_seconds / 60)}m ${s.duration_seconds % 60}s`
                    : 'ongoing';
                const status = s.end_time ? '✅ Ended' : '🔄 Active';
                console.log(`   ${i + 1}. ${s.full_name} - ${s.session_type} - ${duration} - ${status} - Focus: ${s.focus_score || 'N/A'}`);
            });
            console.log('');
        }
        
        // Test 5: Verify data integrity
        console.log('5️⃣ Data integrity checks...');
        
        // Check for orphaned emotions (no matching session)
        const orphanedEmotions = await sql`
            SELECT COUNT(*) as count
            FROM emotion_history e
            LEFT JOIN work_sessions s ON e.session_id = s.id
            WHERE s.id IS NULL
        `;
        
        if (orphanedEmotions[0].count > 0) {
            console.log(`   ⚠️  ${orphanedEmotions[0].count} emotions without matching sessions`);
        } else {
            console.log(`   ✅ All emotions have valid sessions`);
        }
        
        // Check for sessions without emotions
        const sessionsWithoutEmotions = await sql`
            SELECT COUNT(*) as count
            FROM work_sessions s
            LEFT JOIN emotion_history e ON s.id = e.session_id
            WHERE e.emotion_id IS NULL AND s.end_time IS NOT NULL
        `;
        
        if (sessionsWithoutEmotions[0].count > 0) {
            console.log(`   ⚠️  ${sessionsWithoutEmotions[0].count} completed sessions without emotions`);
        } else {
            console.log(`   ✅ All completed sessions have emotions`);
        }
        
        console.log('');
        
        // Test 6: Sample data for export
        if (userCount[0].count > 0 && emotionCount[0].count > 0) {
            console.log('6️⃣ Sample export data...');
            
            const sampleUser = await sql`SELECT id, email, full_name FROM users LIMIT 1`;
            const userId = sampleUser[0].id;
            
            const exportData = await sql`
                SELECT 
                    COUNT(*) as emotion_count,
                    COUNT(DISTINCT session_id) as session_count,
                    AVG(focus_score) as avg_focus,
                    MIN(detected_at) as first_emotion,
                    MAX(detected_at) as last_emotion
                FROM emotion_history
                WHERE user_id = ${userId}
            `;
            
            console.log(`   User: ${sampleUser[0].full_name} (${sampleUser[0].email})`);
            console.log(`   Total emotions: ${exportData[0].emotion_count}`);
            console.log(`   Sessions: ${exportData[0].session_count}`);
            console.log(`   Avg focus: ${Math.round(exportData[0].avg_focus || 0)}/100`);
            console.log(`   First: ${new Date(exportData[0].first_emotion).toLocaleString('vi-VN')}`);
            console.log(`   Last: ${new Date(exportData[0].last_emotion).toLocaleString('vi-VN')}`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Database test completed successfully!\n');
        
    } catch (error) {
        console.error('\n❌ Database test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run test
testDatabase().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
