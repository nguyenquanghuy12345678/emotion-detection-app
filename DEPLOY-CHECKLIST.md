# ✅ VERCEL DEPLOYMENT CHECKLIST

## 📋 Trước khi Deploy

### 1. Code Ready ✅
- [x] app-realtime.js đã tạo
- [x] Export features đã xóa
- [x] Database chỉ 4 bảng
- [x] Timezone UTC+7
- [x] Dependencies cleaned (xóa jsPDF, PapaParse)
- [x] npm install success (129 packages, 0 vulnerabilities)

### 2. Files Clean ✅
- [x] Xóa api/exports/
- [x] Xóa api/productivity/
- [x] Xóa js/app.js, app-fixed.js, app-main.js
- [x] Xóa export-service.js, productivity.js
- [x] Xóa backup/, test/
- [x] .gitignore updated

### 3. Vercel Config ✅
- [x] vercel.json có camera permissions
- [x] API routes configured
- [x] CORS headers set
- [x] Security headers added

## 🚀 Deploy Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Create Neon Database
1. Truy cập: https://console.neon.tech
2. Create Project: `emotion-detection-db`
3. Copy Connection String
4. Format: `postgresql://user:pass@host/db?sslmode=require`

### Step 3: Init Database
**Option A: Local**
```bash
# Add to .env
DATABASE_URL=postgresql://...

# Run
node scripts/init-db.js
```

**Option B: Neon Console**
- Copy `database/schema-realtime.sql`
- Paste vào Neon SQL Editor
- Execute

### Step 4: Deploy to Vercel
1. Login: https://vercel.com
2. Click "Add New" → "Project"
3. Import GitHub repo: `emotion-detection-app`
4. Configure:
   - Framework: **Other**
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

### Step 5: Environment Variables
Add in Vercel Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
```

Apply to: Production, Preview, Development

### Step 6: Deploy!
Click "Deploy" → Wait 1-2 minutes

## ✅ Post-Deploy Testing

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/health
```

Expected:
```json
{
  "status": "ok",
  "message": "Emotion Detection API - Vercel Serverless",
  "timestamp": "2025-11-26T...",
  "env": "production"
}
```

### 2. Browser Test
1. Open: `https://your-app.vercel.app`
2. Should see: AI Emotion Detection page
3. Login: `demo@example.com` / `demo123`
4. Allow camera permissions
5. Camera auto-starts
6. Move into frame → Face detected
7. 2 seconds → Auto-start tracking
8. Emotions saved every 10s

### 3. Database Check (Neon Console)
```sql
-- Check users
SELECT * FROM users;

-- Check latest session
SELECT * FROM work_sessions 
ORDER BY start_time DESC 
LIMIT 1;

-- Check emotions
SELECT * FROM emotion_history 
ORDER BY detected_at DESC 
LIMIT 10;
```

## 🎯 Expected Results

- ✅ App loads on HTTPS
- ✅ Camera permissions work (HTTPS required)
- ✅ Face detection active
- ✅ Auto-start after 2s
- ✅ Emotions save to Neon every 10s
- ✅ Stop button shows confirm dialog
- ✅ Session ends and syncs
- ✅ Timestamps in UTC+7

## 🐛 Common Issues & Fixes

### Camera not working
**Problem**: Browser blocks camera on HTTP  
**Solution**: Vercel auto-provides HTTPS ✅

### Database connection error
**Problem**: DATABASE_URL wrong or missing  
**Solution**: 
- Check Vercel Environment Variables
- Ensure `?sslmode=require` at end
- Test connection in Neon dashboard

### API 404
**Problem**: API routes not found  
**Solution**: 
- Check `api/` folder structure
- Each file needs `export default function handler(req, res)`
- Redeploy

### Build fails
**Problem**: Dependencies issues  
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Fix dependencies"
git push
```

## 📊 Monitoring

### Vercel Dashboard:
- **Functions**: Check API response times
- **Analytics**: User traffic
- **Logs**: Real-time errors
- **Deployments**: Rollback if needed

### Neon Dashboard:
- **Queries**: SQL performance
- **Connections**: Active users
- **Storage**: Database size
- **Branches**: Multiple environments

## 🎉 Success!

Your app is now live at: `https://your-app.vercel.app`

**Share it:**
```
🎭 AI Emotion Detection - Realtime Tracking

✨ Auto-start on face detection
📊 Save emotions every 10s
🕒 Vietnam timezone (UTC+7)
🔒 Secure HTTPS + Neon database

Try it: https://your-app.vercel.app
Login: demo@example.com / demo123
```

## 🔄 Future Updates

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Vercel auto-deploys in 1-2 minutes!
```

## 📖 Documentation

- **User Guide**: [docs/GUIDE.md](docs/GUIDE.md)
- **Full README**: [README.md](README.md)
- **Deployment**: [VERCEL-DEPLOY.md](VERCEL-DEPLOY.md)
- **Completion**: [DONE.md](DONE.md)

---

✅ **All systems ready for production deployment!**
