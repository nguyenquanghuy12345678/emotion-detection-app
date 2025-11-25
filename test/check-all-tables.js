const {neon} = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAllTables() {
    console.log('📋 Full Database Inventory...\n');
    
    // List all tables
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `;
    
    console.log('📦 Tables in database:');
    tables.forEach(t => console.log('   -', t.table_name));
    console.log('');
    
    // For each table, show columns
    for (const table of tables) {
        const columns = await sql`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = ${table.table_name}
            ORDER BY ordinal_position
        `;
        
        console.log(`\n📝 Table: ${table.table_name}`);
        columns.forEach(c => {
            console.log(`   - ${c.column_name} (${c.data_type})`);
        });
    }
    
    // Count rows in each table
    console.log('\n\n📊 Row Counts:');
    for (const table of tables) {
        try {
            const result = await sql`SELECT COUNT(*) as count FROM ${sql(table.table_name)}`;
            console.log(`   - ${table.table_name}: ${result[0].count} rows`);
        } catch (e) {
            console.log(`   - ${table.table_name}: Error counting`);
        }
    }
}

checkAllTables().catch(console.error);
