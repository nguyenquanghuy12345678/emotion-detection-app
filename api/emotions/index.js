// Vercel Serverless Function - Save Emotion
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

    const { sessionId, emotion, confidence, focusScore, metadata } = req.body;

    if (!sessionId || !emotion) {
      return res.status(400).json({ error: 'Session ID and emotion required' });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Save emotion to emotion_history table
    const result = await sql`
      INSERT INTO emotion_history (
        user_id, session_id, emotion, confidence, 
        focus_score, detected_at
      )
      VALUES (
        ${decoded.userId}, ${sessionId}, ${emotion}, 
        ${confidence || 0}, ${Math.round(focusScore || 0)}, 
        NOW()
      )
      RETURNING emotion_id, user_id, session_id, emotion, confidence, focus_score, detected_at
    `;

    res.status(201).json({
      message: 'Emotion saved',
      emotion: result[0]
    });

  } catch (error) {
    console.error('Save emotion error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Failed to save emotion' });
  }
}
