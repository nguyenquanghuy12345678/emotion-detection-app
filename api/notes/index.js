// Vercel Serverless Function - Create Note
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    const sql = neon(process.env.DATABASE_URL);

    // GET - List notes
    if (req.method === 'GET') {
      const limit = parseInt(req.query.limit) || 50;

      const notes = await sql`
        SELECT * FROM work_notes
        WHERE user_id = ${decoded.userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return res.status(200).json({ notes });
    }

    // POST - Create note
    if (req.method === 'POST') {
      const { sessionId, noteText, emotion, focusScore, tags } = req.body;

      if (!noteText) {
        return res.status(400).json({ error: 'Note text required' });
      }

      const result = await sql`
        INSERT INTO work_notes (
          user_id, session_id, note_text, emotion,
          focus_score, tags, created_at
        )
        VALUES (
          ${decoded.userId}, ${sessionId || null}, ${noteText},
          ${emotion || null}, ${focusScore || 0},
          ${JSON.stringify(tags || [])}, NOW()
        )
        RETURNING *
      `;

      return res.status(201).json({
        message: 'Note created',
        note: result[0]
      });
    }

    // DELETE - Delete note
    if (req.method === 'DELETE') {
      const noteId = req.query.id;

      if (!noteId) {
        return res.status(400).json({ error: 'Note ID required' });
      }

      await sql`
        DELETE FROM work_notes
        WHERE id = ${noteId} AND user_id = ${decoded.userId}
      `;

      return res.status(200).json({ message: 'Note deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Notes error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Request failed' });
  }
}
