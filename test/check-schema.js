const {neon} = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
    console.log('📋 Checking Database Schema...\n');
    
    // Check users table
    const usersColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
    `;
    console.log('Users columns:', usersColumns.map(c => c.column_name).join(', '));
    
    // Check work_sessions table
    const sessionsColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'work_sessions' 
        ORDER BY ordinal_position
    `;
    console.log('Work_sessions columns:', sessionsColumns.map(c => c.column_name).join(', '));
    
    // Check emotion_history table
    const emotionsColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'emotion_history' 
        ORDER BY ordinal_position
    `;
    console.log('Emotion_history columns:', emotionsColumns.map(c => c.column_name).join(', '));
    
    // Check work_notes table
    const notesColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'work_notes' 
        ORDER BY ordinal_position
    `;
    console.log('Work_notes columns:', notesColumns.map(c => c.column_name).join(', '));
}

checkSchema().catch(console.error);
