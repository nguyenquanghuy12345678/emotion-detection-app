// Vercel Serverless Function - Health Check
export default async function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Emotion Detection API - Vercel Serverless',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
}
