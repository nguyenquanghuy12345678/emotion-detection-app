// Vercel Serverless Function - End Session
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
    jwt.verify(token, process.env.JWT_SECRET);

    // Get session ID from URL path
    const sessionId = req.query.id;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const { focusScore, pomodoroCount } = req.body;

    const sql = neon(process.env.DATABASE_URL);

    // Update session
    const result = await sql`
      UPDATE work_sessions
      SET end_time = NOW(),
          focus_score = ${focusScore || 0},
          pomodoro_count = ${pomodoroCount || 0}
      WHERE id = ${sessionId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json({
      message: 'Session ended',
      session: result[0]
    });

  } catch (error) {
    console.error('End session error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Failed to end session' });
  }
}
