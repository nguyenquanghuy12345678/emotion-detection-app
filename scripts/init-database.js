// ============================================
// DATABASE INITIALIZATION SCRIPT
// Run this to create all tables and setup schema
// ============================================

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function initDatabase() {
    console.log('🚀 Starting database initialization...\n');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment variables');
        console.error('Please create a .env file with DATABASE_URL=your_neon_connection_string');
        process.exit(1);
    }

    try {
        // Connect to database
        const sql = neon(process.env.DATABASE_URL);
        console.log('✅ Connected to Neon Database\n');

        // Read schema file
        const schemaPath = path.join(__dirname, '..', 'database', 'schema-clean.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📖 Reading schema-clean.sql...\n');

        // Split into individual statements
        const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

        let successCount = 0;
        let errorCount = 0;

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            try {
                // Extract statement type for logging
                const match = statement.match(/^(CREATE|INSERT|ALTER|DROP|COMMENT)/i);
                const type = match ? match[1].toUpperCase() : 'UNKNOWN';
                
                await sql([statement]);
                successCount++;
                console.log(`✅ [${i + 1}/${statements.length}] ${type} - Success`);
            } catch (error) {
                errorCount++;
                // Ignore "already exists" errors
                if (error.message.includes('already exists')) {
                    console.log(`⚠️  [${i + 1}/${statements.length}] Already exists - Skipped`);
                } else {
                    console.error(`❌ [${i + 1}/${statements.length}] Error:`, error.message);
                }
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 INITIALIZATION SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log('='.repeat(50) + '\n');

        // Verify tables created
        console.log('🔍 Verifying tables...\n');
        
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `;

        console.log('📋 Created tables:');
        tables.forEach(t => console.log(`   - ${t.table_name}`));

        // Verify views
        const views = await sql`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;

        if (views.length > 0) {
            console.log('\n📊 Created views:');
            views.forEach(v => console.log(`   - ${v.table_name}`));
        }

        // Check demo user
        const users = await sql`SELECT email FROM users WHERE email = 'demo@emotiontracker.com'`;
        if (users.length > 0) {
            console.log('\n👤 Demo user exists: demo@emotiontracker.com (password: demo123)');
        }

        console.log('\n✅ Database initialization completed successfully!\n');

    } catch (error) {
        console.error('\n❌ Fatal error during initialization:', error);
        process.exit(1);
    }
}

// Run initialization
initDatabase();
