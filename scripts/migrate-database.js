#!/usr/bin/env node

/**
 * MIGRATION SCRIPT
 * Fix existing database to match new schema
 * Run this if you already have data in Neon
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
    console.log('🔄 Starting database migration...\n');
    
    try {
        // Check if tables exist
        console.log('1️⃣ Checking existing tables...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `;
        
        const tableNames = tables.map(t => t.table_name);
        console.log('   Found tables:', tableNames.join(', '));
        console.log('');
        
        // Migration 1: Fix emotion_history table
        if (tableNames.includes('emotion_history')) {
            console.log('2️⃣ Migrating emotion_history table...');
            
            // Check current columns
            const columns = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'emotion_history'
            `;
            
            const columnNames = columns.map(c => c.column_name);
            console.log('   Current columns:', columnNames.join(', '));
            
            // Rename 'id' to 'emotion_id' if needed
            if (columnNames.includes('id') && !columnNames.includes('emotion_id')) {
                console.log('   📝 Renaming column: id → emotion_id');
                await sql`ALTER TABLE emotion_history RENAME COLUMN id TO emotion_id`;
            }
            
            // Rename 'timestamp' to 'detected_at' if needed
            if (columnNames.includes('timestamp') && !columnNames.includes('detected_at')) {
                console.log('   📝 Renaming column: timestamp → detected_at');
                await sql`ALTER TABLE emotion_history RENAME COLUMN timestamp TO detected_at`;
            }
            
            // Remove 'metadata' column if exists (not used in code)
            if (columnNames.includes('metadata')) {
                console.log('   📝 Dropping unused column: metadata');
                await sql`ALTER TABLE emotion_history DROP COLUMN IF EXISTS metadata`;
            }
            
            // Change focus_score to INTEGER if it's DECIMAL
            console.log('   📝 Ensuring focus_score is INTEGER');
            await sql`
                ALTER TABLE emotion_history 
                ALTER COLUMN focus_score TYPE INTEGER USING ROUND(focus_score)
            `;
            
            // Add constraint for valid emotions
            try {
                await sql`
                    ALTER TABLE emotion_history 
                    ADD CONSTRAINT valid_emotion 
                    CHECK (emotion IN ('happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted'))
                `;
                console.log('   ✅ Added emotion validation constraint');
            } catch (err) {
                if (err.message.includes('already exists')) {
                    console.log('   ℹ️  Emotion constraint already exists');
                } else {
                    console.warn('   ⚠️  Could not add emotion constraint:', err.message);
                }
            }
            
            console.log('   ✅ emotion_history migrated');
            console.log('');
        }
        
        // Migration 2: Fix work_sessions table
        if (tableNames.includes('work_sessions')) {
            console.log('3️⃣ Migrating work_sessions table...');
            
            console.log('   📝 Ensuring focus_score is INTEGER');
            await sql`
                ALTER TABLE work_sessions 
                ALTER COLUMN focus_score TYPE INTEGER USING ROUND(focus_score)
            `;
            
            console.log('   ✅ work_sessions migrated');
            console.log('');
        }
        
        // Migration 3: Fix work_notes table
        if (tableNames.includes('work_notes')) {
            console.log('4️⃣ Migrating work_notes table...');
            
            const notesColumns = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'work_notes'
            `;
            
            const notesColumnNames = notesColumns.map(c => c.column_name);
            
            // Rename 'id' to 'note_id' if needed
            if (notesColumnNames.includes('id') && !notesColumnNames.includes('note_id')) {
                console.log('   📝 Renaming column: id → note_id');
                await sql`ALTER TABLE work_notes RENAME COLUMN id TO note_id`;
            }
            
            console.log('   ✅ work_notes migrated');
            console.log('');
        }
        
        // Migration 4: Fix export_history table
        if (tableNames.includes('export_history')) {
            console.log('5️⃣ Migrating export_history table...');
            
            const exportColumns = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'export_history'
            `;
            
            const exportColumnNames = exportColumns.map(c => c.column_name);
            
            // Rename 'id' to 'export_id' if needed
            if (exportColumnNames.includes('id') && !exportColumnNames.includes('export_id')) {
                console.log('   📝 Renaming column: id → export_id');
                await sql`ALTER TABLE export_history RENAME COLUMN id TO export_id`;
            }
            
            // Rename 'created_at' to 'exported_at' if needed
            if (exportColumnNames.includes('created_at') && !exportColumnNames.includes('exported_at')) {
                console.log('   📝 Renaming column: created_at → exported_at');
                await sql`ALTER TABLE export_history RENAME COLUMN created_at TO exported_at`;
            }
            
            // Add constraint for valid export types
            try {
                await sql`
                    ALTER TABLE export_history 
                    ADD CONSTRAINT valid_export_type 
                    CHECK (export_type IN ('pdf', 'csv'))
                `;
                console.log('   ✅ Added export type validation');
            } catch (err) {
                if (err.message.includes('already exists')) {
                    console.log('   ℹ️  Export type constraint already exists');
                } else {
                    console.warn('   ⚠️  Could not add export type constraint:', err.message);
                }
            }
            
            console.log('   ✅ export_history migrated');
            console.log('');
        }
        
        // Migration 5: Fix productivity_stats table
        if (tableNames.includes('productivity_stats')) {
            console.log('6️⃣ Migrating productivity_stats table...');
            
            // Drop views that depend on this table
            console.log('   📝 Dropping dependent views...');
            try {
                await sql`DROP VIEW IF EXISTS v_daily_productivity CASCADE`;
                await sql`DROP VIEW IF EXISTS v_weekly_productivity CASCADE`;
                console.log('   ✅ Views dropped');
            } catch (err) {
                console.warn('   ⚠️  Could not drop views:', err.message);
            }
            
            const statsColumns = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'productivity_stats'
            `;
            
            const statsColumnNames = statsColumns.map(c => c.column_name);
            
            // Rename 'id' to 'stats_id' if needed
            if (statsColumnNames.includes('id') && !statsColumnNames.includes('stats_id')) {
                console.log('   📝 Renaming column: id → stats_id');
                await sql`ALTER TABLE productivity_stats RENAME COLUMN id TO stats_id`;
            }
            
            // Change average_focus_score to INTEGER
            console.log('   📝 Ensuring average_focus_score is INTEGER');
            await sql`
                ALTER TABLE productivity_stats 
                ALTER COLUMN average_focus_score TYPE INTEGER USING ROUND(average_focus_score)
            `;
            
            console.log('   ✅ productivity_stats migrated');
            console.log('');
        }
        
        // Migration 6: Fix alert_logs table
        if (tableNames.includes('alert_logs')) {
            console.log('7️⃣ Migrating alert_logs table...');
            
            const alertColumns = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'alert_logs'
            `;
            
            const alertColumnNames = alertColumns.map(c => c.column_name);
            
            // Rename 'id' to 'alert_id' if needed
            if (alertColumnNames.includes('id') && !alertColumnNames.includes('alert_id')) {
                console.log('   📝 Renaming column: id → alert_id');
                await sql`ALTER TABLE alert_logs RENAME COLUMN id TO alert_id`;
            }
            
            // Add priority constraint
            try {
                await sql`
                    ALTER TABLE alert_logs 
                    ADD CONSTRAINT valid_priority 
                    CHECK (priority IN ('low', 'medium', 'high'))
                `;
                console.log('   ✅ Added priority validation');
            } catch (err) {
                if (err.message.includes('already exists')) {
                    console.log('   ℹ️  Priority constraint already exists');
                }
            }
            
            console.log('   ✅ alert_logs migrated');
            console.log('');
        }
        
        // Migration 7: Fix absence_logs table
        if (tableNames.includes('absence_logs')) {
            console.log('8️⃣ Migrating absence_logs table...');
            
            const absenceColumns = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'absence_logs'
            `;
            
            const absenceColumnNames = absenceColumns.map(c => c.column_name);
            
            // Rename 'id' to 'absence_id' if needed
            if (absenceColumnNames.includes('id') && !absenceColumnNames.includes('absence_id')) {
                console.log('   📝 Renaming column: id → absence_id');
                await sql`ALTER TABLE absence_logs RENAME COLUMN id TO absence_id`;
            }
            
            console.log('   ✅ absence_logs migrated');
            console.log('');
        }
        
        // Verify migration
        console.log('9️⃣ Verifying migration...');
        
        // Check emotion_history columns
        const emotionCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'emotion_history'
            ORDER BY ordinal_position
        `;
        
        console.log('\n   emotion_history columns:');
        emotionCols.forEach(col => {
            console.log(`      - ${col.column_name} (${col.data_type})`);
        });
        
        // Count records
        if (tableNames.includes('emotion_history')) {
            const count = await sql`SELECT COUNT(*) as count FROM emotion_history`;
            console.log(`\n   📊 emotion_history has ${count[0].count} records`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!\n');
        console.log('Next steps:');
        console.log('1. Test the application');
        console.log('2. Verify data in database');
        console.log('3. Run: node test-data-flow.js\n');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run migration
migrate();
