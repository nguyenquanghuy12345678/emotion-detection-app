# 🚀 VERCEL DEPLOYMENT GUIDE

## ✅ Pre-deployment Checklist

### 1. Environment Variables cần thiết trên Vercel:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NODE_ENV=production
```

### 2. Setup trên Vercel Dashboard:

1. **Import Repository**
   - Login vào https://vercel.com
   - Click "Add New" → "Project"
   - Import repository: `emotion-detection-app`

2. **Configure Environment Variables**
   - Settings → Environment Variables
   - Thêm 3 biến trên (DATABASE_URL, JWT_SECRET, NODE_ENV)
   - Apply cho: Production, Preview, Development

3. **Build Settings** (auto-detect)
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

4. **Deploy!**
   - Click "Deploy"
   - Đợi ~1-2 phút

## 📊 Database Setup (Neon)

### Tạo Neon Database:

1. Truy cập https://neon.tech
2. Tạo project mới: `emotion-detection-db`
3. Copy **Connection String**
4. Paste vào Vercel Environment Variables → `DATABASE_URL`

### Init Database:

**Option 1: Local (Recommended)**
```bash
# Set DATABASE_URL trong .env
DATABASE_URL=postgresql://...

# Run init
node scripts/init-db.js
```

**Option 2: Neon Console**
```sql
-- Copy nội dung từ database/schema-realtime.sql
-- Paste vào Neon SQL Editor
-- Run query
```

## 🎯 Vercel Deployment Flow

```
1. Push code to GitHub
   ↓
2. Vercel auto-detect changes
   ↓
3. Build & Deploy (~1-2 min)
   ↓
4. Your app live at: https://your-app.vercel.app
```

## 🔧 API Endpoints trên Vercel

Tất cả API routes tự động work:

- `GET  /api/health` - Health check
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET  /api/auth/me` - User info
- `POST /api/sessions/start` - Start session
- `POST /api/sessions/end` - End session
- `POST /api/emotions` - Save emotion
- `POST /api/notes` - Save note

## 📱 Camera Permissions

⚠️ **QUAN TRỌNG**: Vercel tự động cung cấp HTTPS

- Camera API chỉ hoạt động trên HTTPS
- Vercel domain: `https://your-app.vercel.app` ✅ HTTPS
- Custom domain: Cần setup SSL certificate

## 🧪 Testing sau Deploy

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/health
```

### 2. Login Test
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'
```

### 3. Browser Test
1. Mở `https://your-app.vercel.app`
2. Allow camera permissions
3. Login: demo@example.com / demo123
4. Camera auto-start → Face detection → Tracking!

## 🔄 Update Deployment

```bash
# Local changes
git add .
git commit -m "Update features"
git push origin main

# Vercel auto-deploy in 1-2 minutes
```

## ⚙️ Vercel Configuration (vercel.json)

✅ Đã config sẵn:
- API routes rewrite
- CORS headers
- Camera permissions headers
- Security headers
- Cache control

Không cần thay đổi gì!

## 🐛 Troubleshooting

### Camera không hoạt động
- ✅ Kiểm tra HTTPS (Vercel mặc định có)
- ✅ Click "Allow" khi browser yêu cầu quyền camera
- ✅ Không dùng HTTP (sẽ bị block)

### Database connection error
- ✅ Kiểm tra DATABASE_URL trong Vercel Settings
- ✅ Kiểm tra Neon database có online không
- ✅ Kiểm tra `?sslmode=require` trong connection string

### API 404 errors
- ✅ Vercel tự động detect `api/` folder
- ✅ Mỗi file cần `export default function handler(req, res)`
- ✅ Check Vercel deployment logs

### Build fails
- ✅ Check `package.json` dependencies
- ✅ Xóa `node_modules` và `package-lock.json`, chạy lại `npm install`
- ✅ Push lại lên GitHub

## 📊 Monitoring

### Vercel Dashboard:
- **Analytics**: User visits, requests
- **Logs**: Real-time function logs
- **Deployments**: History & rollback
- **Domains**: Custom domain setup

### Neon Dashboard:
- **Queries**: SQL query monitoring
- **Connections**: Active connections
- **Storage**: Database size
- **Branches**: Database branching

## 🎉 Post-Deployment

### Custom Domain (Optional):
1. Vercel Settings → Domains
2. Add your domain: `emotion-tracker.com`
3. Update DNS records
4. Auto SSL certificate

### Demo Users:
- Email: `demo@example.com`
- Password: `demo123`

### Share your app:
```
🎭 AI Emotion Tracker
https://your-app.vercel.app

✨ Features:
- Auto-start camera on face detection
- Realtime emotion tracking (every 10s)
- Timezone: UTC+7 (Vietnam)
- Neon PostgreSQL backend
```

## ✅ Deployment Checklist

- [ ] GitHub repo pushed
- [ ] Neon database created
- [ ] Database initialized (run init-db.js)
- [ ] Vercel project created
- [ ] Environment variables set (DATABASE_URL, JWT_SECRET)
- [ ] Deployment successful
- [ ] Health check returns OK
- [ ] Login works
- [ ] Camera permissions granted
- [ ] Face detection works
- [ ] Emotion tracking saves to DB
- [ ] Stop button shows confirm dialog

## 🚀 You're Live!

**Your app**: https://your-app.vercel.app  
**Database**: Neon PostgreSQL (UTC+7)  
**API**: Vercel Serverless Functions  
**Frontend**: Static hosting  

🎉 **Enjoy your production-ready emotion tracking app!**
