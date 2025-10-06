# 🌐 DEPLOY LÊN WEB/DOMAIN - HƯỚNG DẪN HOÀN CHỈNH

## ✅ ĐÃ FIX ĐỂ CHẠY TRÊN WEB

### Những gì đã sửa:

1. **✅ Auto-detect Environment**
   - Localhost: Dùng models local (`./models/`)
   - Production: Dùng CDN (nhanh hơn, không cần upload models)

2. **✅ HTTPS Check**
   - Tự động kiểm tra HTTPS khi deploy
   - Camera CHỈ hoạt động trên HTTPS (không phải HTTP)

3. **✅ Camera Front-Facing**
   - Mặc định dùng camera trước (quay mặt)
   - `facingMode: 'user'` = Front camera
   - Có thể switch qua camera sau

4. **✅ Enhanced Error Messages**
   - Chi tiết lỗi camera (permissions, not found, etc.)
   - Hướng dẫn fix cụ thể cho từng lỗi

5. **✅ Better Video Quality**
   - 1280x720 (720p) thay vì 640x480
   - 30-60 FPS
   - Tự động điều chỉnh theo device

## 🚀 CÁCH DEPLOY

### Option 1: GitHub Pages (MIỄN PHÍ - KHUYẾN NGHỊ)

**Bước 1: Tạo repository trên GitHub**
```bash
# Trong PowerShell
cd d:\CODE_WORD\emotion-detection-app\emotion-detection-app

# Init git (nếu chưa có)
git init

# Add files
git add .

# Commit
git commit -m "Deploy emotion detection app"

# Tạo repo trên GitHub rồi:
git remote add origin https://github.com/YOUR_USERNAME/emotion-detection.git
git branch -M main
git push -u origin main
```

**Bước 2: Enable GitHub Pages**
1. Vào Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `root`
4. Save

**Bước 3: Truy cập**
```
https://YOUR_USERNAME.github.io/emotion-detection/
```

✅ **Tự động HTTPS**
✅ **Miễn phí**
✅ **Custom domain được**

---

### Option 2: Vercel (MIỄN PHÍ - NHANH NHẤT)

**Bước 1: Install Vercel CLI**
```powershell
npm install -g vercel
```

**Bước 2: Deploy**
```powershell
cd d:\CODE_WORD\emotion-detection-app\emotion-detection-app
vercel
```

Follow prompts → Done!

**Kết quả:**
```
https://your-project.vercel.app
```

✅ **Tự động HTTPS**
✅ **Cực nhanh (CDN toàn cầu)**
✅ **Free custom domain**

---

### Option 3: Netlify (MIỄN PHÍ)

**Cách 1: Drag & Drop**
1. Vào https://app.netlify.com/drop
2. Kéo thả thư mục `emotion-detection-app`
3. Done!

**Cách 2: CLI**
```powershell
npm install -g netlify-cli
cd d:\CODE_WORD\emotion-detection-app\emotion-detection-app
netlify deploy --prod
```

---

### Option 4: Hosting Truyền Thống (cPanel/FTP)

**Bước 1: Upload files**
```
emotion-detection-app/
├── index.html
├── diagnostic.html
├── js/
│   ├── app.js
│   ├── camera.js  (✅ ĐÃ SỬA)
│   ├── config.js  (✅ ĐÃ SỬA)
│   └── emotions.js
├── css/
│   └── styles.css
└── models/ (KHÔNG CẦN - dùng CDN)
```

**Bước 2: Cấu hình SSL/HTTPS**
- Trong cPanel → SSL/TLS → Enable AutoSSL
- Hoặc dùng Let's Encrypt (miễn phí)

**Bước 3: Truy cập**
```
https://yourdomain.com
```

⚠️ **BẮT BUỘC HTTPS!** Camera không hoạt động trên HTTP!

---

## 🔒 YÊU CẦU HTTPS

### Tại sao cần HTTPS?

Browser bảo mật không cho phép truy cập camera/mic qua HTTP (không mã hóa).

**✅ OK:**
```
https://yourdomain.com          ← OK
https://localhost               ← OK (exception)
http://localhost                ← OK (exception)
http://127.0.0.1               ← OK (exception)
```

**❌ KHÔNG OK:**
```
http://yourdomain.com           ← Camera bị block!
http://yourip.com               ← Camera bị block!
```

### Cách có HTTPS miễn phí:

1. **GitHub Pages** - Tự động HTTPS
2. **Vercel/Netlify** - Tự động HTTPS
3. **Cloudflare** - Free SSL cho bất kỳ domain
4. **Let's Encrypt** - Free SSL certificate

---

## ⚙️ CẤU HÌNH ĐÃ TỐI ƯU

### File: `js/config.js`

```javascript
MODEL_URL: (() => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    // Localhost: local models
    // Production: CDN (faster, không cần upload)
    return isLocalhost ? './models/' : 
           'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
})(),

VIDEO_WIDTH: 1280,        // 720p quality
VIDEO_HEIGHT: 720,
VIDEO_FACING_MODE: 'user', // Front camera

ENABLE_HTTPS_CHECK: true,  // Check HTTPS in production
ENABLE_DEBUG_LOG: false    // Disable logs in production
```

### File: `js/camera.js`

```javascript
// ✅ HTTPS check
checkHTTPS()

// ✅ Enhanced constraints
facingMode: 'user'  // Front camera

// ✅ Detailed error messages
NotAllowedError → Hướng dẫn cấp quyền
NotFoundError → Camera không tìm thấy
etc.
```

---

## 📱 TEST TRÊN THIẾT BỊ KHÁC

### Desktop:
```
https://yourdomain.com
```

### Mobile:
```
https://yourdomain.com
```
- Tự động dùng front camera
- Responsive design
- Touch-friendly

### Tablet:
```
https://yourdomain.com
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Camera blocked"

**Nguyên nhân:** Không phải HTTPS

**Giải pháp:**
1. Deploy lên GitHub Pages/Vercel/Netlify
2. Hoặc cài SSL certificate
3. Đảm bảo URL bắt đầu bằng `https://`

---

### Lỗi: "Permission denied"

**Nguyên nhân:** User từ chối quyền camera

**Giải pháp:**
1. Click vào 🔒 trên address bar
2. Camera → Allow
3. Reload (F5)

---

### Lỗi: "Models failed to load"

**Nguyên nhân:** 
- CDN bị block
- CORS issue

**Giải pháp:**
1. Kiểm tra internet
2. Thử reload (Ctrl + F5)
3. Nếu vẫn lỗi: Upload models lên server

---

### Lỗi: "Mixed content"

**Nguyên nhân:** Trang HTTPS load resources từ HTTP

**Giải pháp:**
Đã fix! Config tự động dùng HTTPS cho CDN.

---

## 📊 PERFORMANCE

### Localhost:
- Models: Local (nhanh)
- Debug logs: Enabled

### Production:
- Models: CDN (không cần upload, auto cache)
- Debug logs: Disabled
- Video: 720p (chất lượng cao)

---

## 🎯 CHECKLIST DEPLOY

- [ ] Code đã fix (config.js, camera.js)
- [ ] Test local: `.\RUN_WITH_LOCAL_MODELS.bat`
- [ ] Tạo git repository
- [ ] Push lên GitHub/GitLab
- [ ] Deploy lên platform (GitHub Pages/Vercel/Netlify)
- [ ] Kiểm tra HTTPS
- [ ] Test camera trên production
- [ ] Test trên mobile
- [ ] Done! 🎉

---

## 🌟 DEMO LINKS

Sau khi deploy, URL sẽ như:

```
GitHub Pages:
https://username.github.io/emotion-detection/

Vercel:
https://emotion-detection.vercel.app/

Netlify:
https://emotion-detection.netlify.app/

Custom domain:
https://yourdomain.com/
```

---

## 💡 MẸO PRO

### 1. Custom Domain (Miễn phí)

GitHub Pages/Vercel/Netlify đều support custom domain miễn phí:

```
CNAME record:
emotion.yourdomain.com → username.github.io
```

### 2. Analytics

Thêm Google Analytics:
```html
<!-- In index.html before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### 3. PWA (Progressive Web App)

Có thể install như app native!

### 4. SEO

Thêm meta tags:
```html
<meta name="description" content="AI Emotion Detection - Nhận diện cảm xúc qua webcam">
<meta property="og:title" content="AI Emotion Detection">
<meta property="og:image" content="thumbnail.jpg">
```

---

## 🚀 DEPLOY NGAY

**Cách nhanh nhất (1 phút):**

```powershell
# Install Vercel
npm install -g vercel

# Deploy
cd d:\CODE_WORD\emotion-detection-app\emotion-detection-app
vercel --prod
```

Done! URL sẽ hiện ngay!

---

**ỨNG DỤNG ĐÃ SẴN SÀNG DEPLOY LÊN WEB!** 🌐✨
