# 🎭 AI Emotion Detection - Camera Realtime Mode

## ✨ Tính năng chính

- ✅ **Auto-start khi phát hiện người**: Camera tự động bắt đầu tracking khi phát hiện khuôn mặt (2 giây delay)
- ✅ **Realtime tracking**: Lưu cảm xúc mỗi 10 giây vào Neon database
- ✅ **Xác nhận dừng**: Dialog xác nhận trước khi dừng phiên làm việc
- ✅ **Timezone Việt Nam**: Tất cả timestamp sử dụng UTC+7 (Asia/Ho_Chi_Minh)
- ✅ **4 bảng đơn giản**: users, work_sessions, emotion_history, work_notes

## 🚀 Deploy lên Vercel

### Quick Deploy:
1. Push repo lên GitHub
2. Import vào Vercel: https://vercel.com/new
3. Thêm Environment Variables:
   ```
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   JWT_SECRET=your-secret-key-min-32-chars
   NODE_ENV=production
   ```
4. Deploy! (1-2 phút)

Chi tiết: Xem [VERCEL-DEPLOY.md](VERCEL-DEPLOY.md)

---

## 🚀 Cách sử dụng

### 1. Cài đặt

```bash
npm install
```

### 2. Setup Database

Chạy init script để tạo database:

```bash
node scripts/init-db.js
```

✅ Kết quả: 4 bảng được tạo với timezone UTC+7

### 3. Chạy Server

```bash
node server.js
```

Server sẽ chạy tại: http://localhost:3000

### 4. Sử dụng App

1. **Đăng nhập**: Email: `demo@example.com` / Password: `demo123`
2. **Camera tự khởi động**: Sau khi đăng nhập, camera sẽ tự động bật
3. **Di chuyển vào khung hình**: App sẽ phát hiện khuôn mặt
4. **Auto-start**: Sau 2 giây phát hiện → Tự động bắt đầu tracking
5. **Tracking realtime**: Cảm xúc được lưu mỗi 10 giây vào Neon
6. **Dừng camera**: Click nút Stop → Xác nhận → Dừng và đồng bộ

## 📊 Database Schema

### 4 bảng chính:

1. **users** - Thông tin người dùng
2. **work_sessions** - Phiên làm việc (auto-calculate duration)
3. **emotion_history** - Lịch sử cảm xúc (saved every 10s)
4. **work_notes** - Ghi chú công việc

### Timestamp: 
- Tất cả đều dùng `(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')`
- Timezone: UTC+7 (Việt Nam)

## 📁 Cấu trúc Project

```
emotion-detection-app/
├── js/
│   ├── app-realtime.js     ← Main app logic
│   ├── api-client.js       ← API calls
│   ├── auth-ui.js          ← Authentication UI
│   ├── camera.js           ← Camera handler
│   ├── emotions.js         ← Emotion display
│   └── config.js           ← Config
├── api/
│   ├── auth/               ← Login/Register
│   ├── sessions/           ← Start/End session
│   └── emotions/           ← Save emotion
├── scripts/
│   └── init-db.js          ← Database setup
├── database/
│   └── schema-realtime.sql ← SQL schema
├── index.html              ← Main page
└── server.js               ← Express server
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - User info

### Sessions
- `POST /api/sessions/start` - Bắt đầu phiên (auto-called)
- `POST /api/sessions/end` - Kết thúc phiên

### Emotions
- `POST /api/emotions` - Lưu cảm xúc (every 10s)

## 🎯 Flow hoạt động

1. User login → Camera auto-start
2. Face detected → 2s countdown
3. Auto-start session → Begin tracking
4. Detect emotion every 10s → Save to Neon
5. User click Stop → Confirm dialog
6. Confirmed → End session → Stop camera
7. Data synced → Alert "Đã lưu vào Neon!"

## 🗑️ Files đã xóa (không dùng)

- ❌ Export PDF/CSV features
- ❌ jsPDF, PapaParse libraries
- ❌ productivity.css, export-service.js
- ❌ app.js, app-fixed.js, app-main.js (replaced by app-realtime.js)
- ❌ 4 tables: export_history, productivity_stats, alert_logs, absence_logs

## ✅ Sẵn sàng sử dụng

Tất cả đã được tối ưu và sạch sẽ. Chỉ giữ lại những gì cần thiết!

**Demo User**: demo@example.com / demo123
**Server**: http://localhost:3000
**Database**: Neon PostgreSQL (UTC+7)

🎉 **Enjoy your realtime emotion tracking!**
