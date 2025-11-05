# 🚀 Deploy to Vercel - Production Guide

## 📋 TL;DR - Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

✅ Done! Your app is live with HTTPS!

---

## 🌐 PRODUCTION FEATURES

### ✅ What Works on Vercel (HTTPS):

1. **👥 Virtual Co-working Space**
   - ✅ Real-time room sync via Serverless API
   - ✅ Shared Pomodoro timer
   - ✅ Group chat
   - ✅ Peer accountability

2. **📤 Web Share API**
   - ✅ Native share dialog (mobile/desktop)
   - ✅ Share to Facebook, Twitter, LinkedIn
   - ✅ Share images with metadata

3. **📋 Clipboard API**
   - ✅ Copy room links
   - ✅ Copy reports
   - ✅ One-click share

4. **📸 Camera Access**
   - ✅ HTTPS required - works perfectly
   - ✅ Face detection
   - ✅ Emotion recognition

5. **🔔 Notifications**
   - ✅ Desktop notifications (if permitted)
   - ✅ Pomodoro completion alerts

---

## 📁 PROJECT STRUCTURE

```
emotion-detection-app/
├── api/                      ← Serverless Functions
│   └── rooms.js              ← Co-working API endpoint
├── js/
│   ├── coworking-space.js    ← LocalStorage version (fallback)
│   ├── coworking-production.js ← API version (production)
│   └── share-manager.js      ← Universal sharing
├── css/
│   └── coworking.css
├── index.html
├── vercel.json               ← Vercel configuration
└── package.json
```

---

## 🔧 VERCEL CONFIGURATION

### `vercel.json` Explained:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        // CORS for API
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        
        // Security headers
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        
        // Enable camera, clipboard, etc.
        { "key": "Permissions-Policy", "value": "camera=*, clipboard-write=*" },
        
        // Caching
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
```

---

## 🛠️ HOW IT WORKS

### Development (localhost):
```
User → localStorage → Direct sync
```

### Production (Vercel):
```
User → API Endpoint → Serverless Function → In-Memory Storage
                  ↓
           Auto-sync every 3s
```

### API Endpoints:

```javascript
GET  /api/rooms              // List all rooms
GET  /api/rooms?roomId=xxx   // Get specific room
POST /api/rooms              // Create new room
PUT  /api/rooms?roomId=xxx   // Update room (join/leave/chat/etc)
DELETE /api/rooms?roomId=xxx // Delete room
```

---

## 🚀 DEPLOYMENT STEPS

### Option 1: Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy to production
vercel --prod

# 4. Your app is live!
# URL: https://emotion-detection-app.vercel.app
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Click "Deploy"
6. ✅ Auto-deployed on every push!

### Option 3: Drag & Drop

1. Zip your project folder
2. Go to [vercel.com/new](https://vercel.com/new)
3. Drag & drop the ZIP
4. Click "Deploy"

---

## 🔍 TESTING ON VERCEL

### 1. Test Co-working Space:

```
https://your-app.vercel.app
→ Click "👥 Co-working" tab
→ Create room
→ Copy link
→ Open in incognito window
→ Join room
→ Test real-time sync!
```

### 2. Test Share Features:

```
https://your-app.vercel.app
→ Detect emotion
→ Click "🔗 Chia sẻ cảm xúc"
→ Should see native share dialog (mobile)
→ Or clipboard copy (desktop)
```

### 3. Test API:

```bash
# List rooms
curl https://your-app.vercel.app/api/rooms

# Create room
curl -X POST https://your-app.vercel.app/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Room"}'
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### 1. API Rate Limiting

Currently: No limits (demo)

Production TODO:
```javascript
// In api/rooms.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 2. Persistent Storage

Current: In-memory (resets on cold start)

Upgrade to:
- **Redis** (Upstash - free tier)
- **MongoDB** (Atlas - free tier)
- **Firebase Realtime Database**

Example with Upstash Redis:

```javascript
// Install: npm install @upstash/redis
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Save room
await redis.set(`room:${roomId}`, JSON.stringify(room));

// Get room
const room = await redis.get(`room:${roomId}`);
```

### 3. WebSocket for Real-time

Current: Polling every 3s

Upgrade to:
```javascript
// Use Pusher or Ably
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.PUSHER_KEY, {
  cluster: 'ap1'
});

const channel = pusher.subscribe('room-' + roomId);
channel.bind('update', (data) => {
  updateRoom(data);
});
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Failed to load rooms"

**Solution:**
```javascript
// Check API endpoint
console.log('API Base:', window.location.hostname);

// Should be: /api for production
// Or: http://localhost:3000/api for dev
```

### Issue: "Web Share not working"

**Causes:**
- Not on HTTPS → Deploy to Vercel
- Browser not supported → Use clipboard fallback
- User cancelled → Normal behavior

**Check:**
```javascript
console.log('Share API:', navigator.share ? 'Supported' : 'Not supported');
```

### Issue: "Room not syncing"

**Debug:**
```javascript
// Check sync interval
console.log('Syncing...');

// Check API response
fetch('/api/rooms?roomId=xxx')
  .then(r => r.json())
  .then(console.log);
```

### Issue: "Camera not working"

**Requirements:**
- ✅ HTTPS (Vercel provides this)
- ✅ User permission
- ✅ Camera available

**Check:**
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(() => console.log('Camera OK'))
  .catch(err => console.error('Camera error:', err));
```

---

## 📊 MONITORING

### Vercel Analytics

```bash
# Enable analytics
vercel --prod

# View analytics
# Go to: https://vercel.com/dashboard/analytics
```

### Custom Logging

```javascript
// In api/rooms.js
export default async function handler(req, res) {
  console.log({
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  
  // ... rest of code
}
```

View logs:
```bash
vercel logs
```

---

## 🔐 SECURITY

### Environment Variables

```bash
# Add secrets
vercel env add REDIS_URL
vercel env add API_KEY

# Use in code
process.env.REDIS_URL
```

### Rate Limiting

```javascript
// Add to api/rooms.js
const requests = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = requests.get(ip) || [];
  
  // Filter last minute
  const recentRequests = userRequests.filter(t => now - t < 60000);
  
  if (recentRequests.length >= 60) {
    return false; // Too many requests
  }
  
  recentRequests.push(now);
  requests.set(ip, recentRequests);
  return true;
}
```

---

## 📈 SCALING

### Current Limits:
- ✅ Free tier: 100GB bandwidth
- ✅ Serverless functions: 10s timeout
- ✅ Regions: Global CDN

### Scaling Strategy:

**10 users**: ✅ Works perfectly on free tier

**100 users**: 
- Consider Redis for storage
- Enable caching
- Monitor bandwidth

**1000+ users**:
- Upgrade to Pro ($20/month)
- Use dedicated database
- Implement WebSockets
- Add load balancing

---

## 🎯 PRODUCTION CHECKLIST

- [x] HTTPS enabled (Vercel auto)
- [x] CORS configured
- [x] Camera permissions in headers
- [x] Clipboard API enabled
- [x] Share API working
- [x] API endpoints tested
- [ ] Add persistent database (Redis/MongoDB)
- [ ] Add authentication (optional)
- [ ] Add rate limiting
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Add monitoring (Vercel Analytics)

---

## 🌟 DEMO LINKS

### Production:
```
https://emotion-detection-app.vercel.app
```

### Test Co-working:
```
https://emotion-detection-app.vercel.app?room=demo
```

### API Health:
```
https://emotion-detection-app.vercel.app/api/rooms
```

---

## 📞 SUPPORT

**Issues?** Open an issue on GitHub

**Questions?** Check the docs:
- [Vercel Docs](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/serverless-functions/introduction)
- [Environment Variables](https://vercel.com/docs/environment-variables)

---

## 🚀 NEXT STEPS

1. **Deploy**: `vercel --prod`
2. **Test**: Open your Vercel URL
3. **Share**: Send link to friends
4. **Monitor**: Check Vercel dashboard
5. **Scale**: Add Redis when needed

---

**Happy Deploying! 🎉**

Built with ❤️ using Vercel, Face-API.js, and vanilla JavaScript.
