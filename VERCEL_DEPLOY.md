# 🚀 DEPLOY LÊN VERCEL - HƯỚNG DẪN

## ✅ CẤU HÌNH ĐÃ SẴN SÀNG

Tất cả đã được cấu hình sẵn để deploy lên Vercel!

### Files đã tạo:
- ✅ `vercel.json` - Vercel configuration
- ✅ `package.json` - NPM configuration  
- ✅ `.gitignore` - Git ignore
- ✅ Code đã fix dùng CDN (không cần models local)

## 🚀 DEPLOY TRONG 3 BƯỚC

### Bước 1: Install Vercel CLI

```powershell
npm install -g vercel
```

### Bước 2: Login vào Vercel

```powershell
vercel login
```

### Bước 3: Deploy

```powershell
cd d:\CODE_WORD\emotion-detection-app
vercel --prod
```

**DONE!** URL sẽ hiện ngay: `https://emotionai-xxx.vercel.app`

## 🌐 HOẶC DEPLOY QUA WEB UI

### Cách 1: Import từ Git

1. Push code lên GitHub:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/nguyenquanghuy12345678/emotionai.git
   git push -u origin main
   ```

2. Vào https://vercel.com/new

3. Import repository `emotionai`

4. Cấu hình:
   - **Project Name:** `emotionai`
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** (để trống)
   - **Output Directory:** `./`
   - **Install Command:** (để trống)

5. Click **Deploy**

### Cách 2: Drag & Drop

1. Vào https://vercel.com/new

2. Kéo thả thư mục `emotion-detection-app`

3. Click **Deploy**

## ⚙️ CẤU HÌNH VERCEL (Đã setup sẵn)

### vercel.json
```json
{
  "name": "emotionai",
  "version": 2,
  "builds": [
    {
      "src": "**/*.html",
      "use": "@vercel/static"
    }
  ]
}
```

### Environment Variables (Optional)
Không cần thiết lập biến môi trường nào!

## ✅ CHECKLIST

- [x] Code đã dùng CDN (không cần models local)
- [x] vercel.json đã tạo
- [x] package.json đã tạo
- [x] .gitignore đã có
- [x] Camera config: front-facing
- [x] HTTPS tự động
- [ ] Deploy lên Vercel
- [ ] Test camera trên production
- [ ] Share link!

## 🎯 SAU KHI DEPLOY

### URL của bạn:
```
https://emotionai.vercel.app
```

Hoặc với tên custom từ Vercel.

### Test:
1. Mở URL
2. Cho phép quyền camera
3. Click "Bắt Đầu"
4. Thử nhận diện cảm xúc!

## 🔧 CUSTOM DOMAIN (Optional)

### Thêm domain của bạn:

1. Vào Vercel Dashboard → Settings → Domains

2. Add domain: `emotion.yourdomain.com`

3. Thêm DNS records theo hướng dẫn

4. Done!

## 📊 MONITORING

### Vercel Dashboard:
- Analytics: Xem lượng traffic
- Logs: Xem errors
- Speed Insights: Performance

## 🐛 TROUBLESHOOTING

### "Camera not working"
→ Đảm bảo URL là HTTPS (Vercel tự động HTTPS)

### "Models failed to load"
→ Đã fix! Dùng CDN rồi, không còn lỗi CORS

### "Build failed"
→ Không có build! Chỉ là static site

## 💡 TIPS

1. **Free Tier:** Đủ dùng cho project này
2. **Auto HTTPS:** Tự động có SSL
3. **CDN Global:** Nhanh ở mọi nơi
4. **Auto Deploy:** Push git → Auto deploy

## 🎉 KẾT LUẬN

Chỉ cần chạy:

```powershell
vercel --prod
```

Hoặc import vào Vercel Dashboard.

**Đơn giản vậy thôi!** 🚀

---

Made with ❤️ using Face-API.js
Deployed on Vercel ⚡
