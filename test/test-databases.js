const {neon} = require('@neondatabase/serverless');

// Test both databases
const db1 = 'postgresql://neondb_owner:npg_JIm4xcPtK8yO@ep-morning-breeze-adoli00f-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const db2 = 'postgresql://neondb_owner:npg_JIm4xcPtK8yO@ep-wild-water-adrlvw5d-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testDatabase(url, name) {
    console.log(`\n🔍 Testing ${name}...`);
    try {
        const sql = neon(url);
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `;
        console.log(`   ✅ Connected! Found ${tables.length} tables`);
        console.log('   Tables:', tables.map(t => t.table_name).join(', '));
        
        // Count users
        const userCount = await sql`SELECT COUNT(*) as count FROM users`;
        console.log(`   👥 Users: ${userCount[0].count}`);
        
        // Count sessions
        const sessionCount = await sql`SELECT COUNT(*) as count FROM work_sessions`;
        console.log(`   📅 Sessions: ${sessionCount[0].count}`);
        
        // Count emotions
        const emotionCount = await sql`SELECT COUNT(*) as count FROM emotion_history`;
        console.log(`   🎭 Emotions: ${emotionCount[0].count}`);
        
    } catch (error) {
        console.log(`   ❌ Error:`, error.message);
    }
}

async function main() {
    await testDatabase(db1, 'Database 1 (morning-breeze)');
    await testDatabase(db2, 'Database 2 (wild-water)');
}

main();
