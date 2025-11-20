// Vercel Serverless Function - Start Session
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { sessionType = 'work' } = req.body;

    const sql = neon(process.env.DATABASE_URL);

    // Create session
    const result = await sql`
      INSERT INTO work_sessions (user_id, session_type, start_time)
      VALUES (${decoded.userId}, ${sessionType}, NOW())
      RETURNING *
    `;

    res.status(201).json({
      message: 'Session started',
      session: result[0]
    });

  } catch (error) {
    console.error('Start session error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Failed to start session' });
  }
}
