// Vercel Serverless Function - Log Export
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

    // POST - Log export
    if (req.method === 'POST') {
      const { exportType, dateRangeStart, dateRangeEnd, fileName } = req.body;

      const result = await sql`
        INSERT INTO export_history (
          user_id, export_type, date_range_start,
          date_range_end, file_name
        )
        VALUES (
          ${decoded.userId}, ${exportType}, ${dateRangeStart},
          ${dateRangeEnd}, ${fileName}
        )
        RETURNING *
      `;

      return res.status(201).json({
        success: true,
        message: 'Export logged',
        data: result[0]
      });
    }

    // GET - Export history
    if (req.method === 'GET') {
      const limit = parseInt(req.query.limit) || 20;

      const exports = await sql`
        SELECT * FROM export_history
        WHERE user_id = ${decoded.userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return res.status(200).json({ 
        success: true,
        data: exports 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Export error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ 
      error: 'Request failed',
      message: error.message 
    });
  }
}
