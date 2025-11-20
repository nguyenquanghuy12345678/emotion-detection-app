# 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL

## ✅ **SẴN SÀNG DEPLOY**

App đã được cấu hình đầy đủ để chạy trên Vercel với Serverless Functions!

---

## 📋 **BƯỚC 1: Chuẩn Bị**

### 1. Tạo tài khoản Vercel
- Truy cập: https://vercel.com
- Sign up với GitHub (khuyến nghị)

### 2. Install Vercel CLI (optional)
```bash
npm i -g vercel
```

---

## 🔧 **BƯỚC 2: Cấu Hình Environment Variables**

Trên Vercel Dashboard, thêm các biến môi trường:

### Variables cần thiết:
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
NODE_ENV=production
```

**Lấy DATABASE_URL từ Neon:**
1. Đăng nhập https://neon.tech
2. Chọn database → Connection Details
3. Copy Pooled connection string

**Tạo JWT_SECRET:**
```bash
# Tạo random string 32 ký tự
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎯 **BƯỚC 3: Deploy**

### Option A: Deploy qua GitHub (Khuyến nghị ⭐)

1. **Push code lên GitHub:**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. **Import vào Vercel:**
- Vào Vercel Dashboard → New Project
- Import từ GitHub repository
- Chọn repo: `emotion-detection-app`
- Click **Deploy**

3. **Thêm Environment Variables:**
- Settings → Environment Variables
- Thêm `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`
- Save

4. **Redeploy:**
- Deployments tab → Click "..." → Redeploy

### Option B: Deploy qua CLI

```bash
# Login
vercel login

# Deploy
vercel

# Thêm environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV

# Deploy production
vercel --prod
```

---

## 📊 **BƯỚC 4: Kiểm Tra**

### Test endpoints:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Expected response:
{
  "status": "ok",
  "message": "Emotion Detection API - Vercel Serverless",
  "timestamp": "2025-11-20T...",
  "env": "production"
}
```

### Test registration:
```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'
```

---

## 🔍 **BƯỚC 5: Xác Minh Hoạt Động**

1. **Mở app:** https://your-app.vercel.app
2. **Click "Đăng ký"** → Tạo tài khoản
3. **Đăng nhập** → Kiểm tra token được lưu
4. **Bật camera** → Start session
5. **Thêm ghi chú** → Lưu vào database
6. **Export PDF/CSV** → Test export functions

---

## 🎨 **CẤU TRÚC SERVERLESS**

```
api/
├── health.js              # GET  /api/health
├── auth/
│   ├── register.js        # POST /api/auth/register
│   ├── login.js           # POST /api/auth/login
│   └── me.js              # GET  /api/auth/me
├── sessions/
│   ├── start.js           # POST /api/sessions/start
│   └── end.js             # POST /api/sessions/end?id=xxx
├── emotions/
│   └── index.js           # POST /api/emotions
├── notes/
│   └── index.js           # GET/POST/DELETE /api/notes
└── exports/
    └── index.js           # GET/POST /api/exports
```

**Mỗi file = 1 serverless function!**

---

## ⚙️ **VERCEL.JSON Explained**

```json
{
  "builds": [
    {
      "src": "api/**/*.js",     // Build tất cả file trong /api
      "use": "@vercel/node"     // Dùng Node.js runtime
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",       // Route API calls
      "dest": "/api/$1"         // Tới serverless functions
    },
    {
      "src": "/(.*)",           // Route static files
      "dest": "/$1"             // HTML/JS/CSS
    }
  ]
}
```

---

## 🐛 **TROUBLESHOOTING**

### Lỗi: "Function not found"
- Kiểm tra file có trong `/api/**/*.js`
- Đảm bảo export default function handler

### Lỗi: "DATABASE_URL not defined"
- Thêm env variables trên Vercel Dashboard
- Redeploy sau khi add env

### Lỗi: "Cannot find module"
- Kiểm tra package.json có dependency
- Vercel tự động chạy `npm install`

### CORS errors:
- Đã config CORS headers trong mỗi function
- Check browser console để xem chi tiết

### Camera không hoạt động:
- Vercel tự động cung cấp HTTPS
- Camera API cần HTTPS (localhost OK)

---

## 📈 **SAU KHI DEPLOY**

### Custom Domain (Optional):
1. Settings → Domains
2. Add domain của bạn
3. Configure DNS

### Analytics:
- Vercel tự động tracking
- Analytics tab để xem traffic

### Logs:
- Deployments → Click deployment → Functions
- Xem logs real-time

### Auto-Deploy:
- Mỗi khi push code lên GitHub
- Vercel tự động build và deploy

---

## ✅ **CHECKLIST**

- [ ] Database schema đã chạy trên Neon
- [ ] Environment variables đã thêm
- [ ] Code đã push lên GitHub
- [ ] Import project vào Vercel
- [ ] Deploy thành công
- [ ] Test `/api/health`
- [ ] Test đăng ký/đăng nhập
- [ ] Test camera + emotion detection
- [ ] Test export PDF/CSV

---

## 🎉 **HOÀN TẤT!**

App của bạn đã live tại:
```
https://your-app.vercel.app
```

**Free tier Vercel:**
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ 100GB serverless execution time/month
- ✅ Auto-deploy from GitHub

---

## 📞 **HỖ TRỢ**

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- GitHub Issues: Report bugs

**Version**: 2.0 - Vercel Ready  
**Last Updated**: November 20, 2025
