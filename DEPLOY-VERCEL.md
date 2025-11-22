# 🚀 Deploy to Vercel - Complete Guide

## Prerequisites

1. **Neon Database**
   - Create account at https://neon.tech
   - Create new database
   - Copy connection string

2. **Vercel Account**
   - Sign up at https://vercel.com
   - Install Vercel CLI: `npm i -g vercel`

## Environment Variables

Set these in Vercel Dashboard or `.env`:

```env
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET=your_super_secret_key_min_32_chars
NODE_ENV=production
```

## Deploy Steps

### 1. Initialize Database

```bash
# Local testing first
node init-database.js
```

Verify all tables created:
- ✅ users
- ✅ work_sessions
- ✅ emotion_history
- ✅ productivity_stats
- ✅ work_notes
- ✅ alert_logs
- ✅ absence_logs
- ✅ export_history

### 2. Test Locally

```bash
# Start server
node server.js

# Open browser
http://localhost:3000

# Test features:
- ✅ Register/Login
- ✅ Camera detection
- ✅ Emotion tracking
- ✅ PDF export
```

### 3. Deploy to Vercel

```bash
# Login
vercel login

# Deploy
vercel

# Follow prompts:
? Set up and deploy "~/emotion-detection-app"? Y
? Which scope? [Your account]
? Link to existing project? N
? What's your project's name? emotion-detection-app
? In which directory is your code located? ./
```

### 4. Configure Environment Variables

```bash
# Via CLI
vercel env add DATABASE_URL
vercel env add JWT_SECRET

# Or via Dashboard
# Go to: Project Settings > Environment Variables
# Add:
#   DATABASE_URL = your_neon_connection_string
#   JWT_SECRET = your_secret_key
```

### 5. Redeploy with Environment

```bash
vercel --prod
```

## Verify Deployment

### Check Endpoints

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Should return:
{
  "status": "ok",
  "message": "Emotion Detection API - Vercel Serverless",
  "timestamp": "2025-11-20T...",
  "env": "production"
}
```

### Test User Registration

```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "fullName": "Test User"
  }'
```

### Test Login

```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## Data Flow - User Authentication

### Guest Mode (Not Logged In)

```javascript
// Data stored in localStorage only
localStorage.setItem('emotions', JSON.stringify([...]));
localStorage.setItem('sessions', JSON.stringify([...]));

// Export uses local data
const data = {
  user: { id: 'guest', email: 'guest@local', full_name: 'Khách' },
  totalWorkTime: 0,
  emotionHistory: []
};

// PDF shows:
// Người dùng: Khách
// Email: guest@local
// ID: guest
```

### Logged In User

```javascript
// Registration/Login saves complete user info
localStorage.setItem('userId', user.id);
localStorage.setItem('userEmail', user.email);
localStorage.setItem('userName', user.full_name);
localStorage.setItem('authToken', token);

// All data sent to Neon database
POST /api/emotions {
  sessionId: 123,
  emotion: 'happy',
  confidence: 0.95,
  focusScore: 85
}

// Export fetches from backend
GET /api/productivity/stats
Authorization: Bearer <token>

// Response includes full user data:
{
  success: true,
  data: {
    user: {
      id: 456,
      email: "user@example.com",
      full_name: "John Doe",
      created_at: "2025-11-20T...",
      last_login: "2025-11-20T..."
    },
    totalWorkTime: 3600,
    emotionHistory: [...],
    workSessions: [...]
  }
}

// PDF shows REAL data:
// Người dùng: John Doe
// Email: user@example.com
// ID: 456
// [All metrics from database]
```

## Data Accuracy Checklist

### ✅ Guest Mode
- [ ] PDF shows "Khách" as name
- [ ] Email shows "guest@local"
- [ ] ID shows "guest"
- [ ] Data from localStorage only
- [ ] No backend calls

### ✅ Logged In Mode
- [ ] PDF shows REAL user name
- [ ] PDF shows REAL email
- [ ] PDF shows REAL user ID
- [ ] Data from Neon database
- [ ] Emotions saved to `emotion_history`
- [ ] Sessions saved to `work_sessions`
- [ ] Stats calculated from database
- [ ] Export logged to `export_history`

## Common Issues

### 1. "Invalid token" error
**Fix**: Check JWT_SECRET is same in Vercel and database

### 2. PDF shows "Khách" for logged in user
**Fix**: Verify user data in localStorage:
```javascript
console.log(localStorage.getItem('user'));
console.log(localStorage.getItem('userName'));
console.log(localStorage.getItem('userEmail'));
```

### 3. No data in PDF export
**Fix**: Check backend API:
```javascript
// Open browser console
const token = localStorage.getItem('authToken');
fetch('/api/productivity/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

### 4. CORS errors
**Fix**: Already configured in `vercel.json` headers

### 5. Database connection fails
**Fix**: 
- Check DATABASE_URL in Vercel env vars
- Verify Neon database is active
- Check connection string has `?sslmode=require`

## Monitoring

### Check Logs

```bash
# Real-time logs
vercel logs

# Filter by function
vercel logs --follow api/productivity/stats.js
```

### Database Queries

```bash
# Connect to Neon database
psql $DATABASE_URL

# Check data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM emotion_history;
SELECT COUNT(*) FROM work_sessions;
SELECT COUNT(*) FROM export_history;
```

## Performance Optimization

### Vercel Configuration

Already optimized in `vercel.json`:
- Static file caching
- API routing
- CORS headers
- Camera permissions

### Database Optimization

Already optimized in `schema.sql`:
- Indexes on user_id
- Indexes on timestamps
- Efficient views
- Triggers for updates

## Support

### Debug Mode

Enable in browser console:
```javascript
localStorage.setItem('debug', 'true');
```

### Check API Client

```javascript
console.log(window.apiClient.isAuthenticated());
console.log(window.apiClient.getCurrentUser());
console.log(window.apiClient.baseURL);
```

### Check Export Service

```javascript
console.log(window.professionalExportService);
await window.professionalExportService.fetchProductivityData();
```

## Success Criteria

✅ **Vercel Deploy**:
- App accessible at https://your-app.vercel.app
- All static files load
- No 404 errors

✅ **Authentication**:
- Can register new user
- Can login
- Token stored correctly
- User data persists

✅ **Data Collection**:
- Emotions save to Neon
- Sessions track properly
- Stats calculate correctly

✅ **PDF Export**:
- Guest shows "Khách"
- Logged in shows real name/email/ID
- Data accurate and complete
- File downloads successfully

---

**Last Updated**: November 20, 2025
**Version**: 2.0 Production Ready
