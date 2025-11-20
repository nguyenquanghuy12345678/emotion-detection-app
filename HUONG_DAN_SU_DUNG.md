# 🎭 HƯỚNG DẪN SỬ DỤNG - EMOTION DETECTION APP

## ✅ **ĐÃ TÍCH HỢP BACKEND**

App đã được tích hợp đầy đủ với backend Neon PostgreSQL và tất cả chức năng hoạt động.

---

## 🚀 **KHỞI ĐỘNG**

### 1. Cài đặt dependencies (chỉ lần đầu)
```bash
npm install
```

### 2. Khởi động server
```bash
npm start
```

Server sẽ chạy tại: **http://localhost:3000**

---

## 📋 **CÁC CHỨC NĂNG ĐÃ HOẠT ĐỘNG**

### ✅ **1. Nhận Diện Cảm Xúc**
- **Camera real-time** với Face-API.js
- **Phát hiện 7 cảm xúc**: Happy, Sad, Angry, Surprised, Neutral, Fearful, Disgusted
- **Lưu vào database** tự động khi đăng nhập
- **Sync thời gian thực** với backend

**Cách dùng:**
1. Click "Thiết lập Camera"
2. Cho phép quyền camera
3. Click "Bắt Đầu" để nhận diện

---

### ✅ **2. Đăng Nhập/Đăng Ký**
- **JWT Authentication** bảo mật
- **Lưu session** tự động
- **Auto-sync** dữ liệu mỗi 5 phút

**Cách dùng:**
1. Click "Đăng Ký" nếu chưa có tài khoản
2. Nhập: Email, Password, Họ tên
3. Hoặc "Đăng Nhập" nếu đã có

---

### ✅ **3. Hỗ Trợ Công Việc**
- **Pomodoro Timer** - 25 phút tập trung
- **Ghi chú công việc** - Lưu database
- **Xuất báo cáo PDF/CSV** - Export dữ liệu

**Cách dùng:**
1. Tab "Hỗ Trợ Công Việc"
2. Bắt đầu Pomodoro
3. Thêm ghi chú
4. Click "Xuất PDF" hoặc "Xuất CSV"

---

### ✅ **4. Thống Kê & Phân Tích**
- **Biểu đồ cảm xúc** theo thời gian
- **Timeline lịch sử** 
- **Điểm tập trung** realtime
- **Gợi ý cải thiện**

**Cách dùng:**
1. Tab "Thống Kê"
2. Xem biểu đồ và timeline
3. Đọc gợi ý từ AI

---

### ✅ **5. AI Trợ Lý**
- **Chat AI** thông minh
- **Cảnh báo tự động** khi stress
- **Gợi ý nghỉ ngơi**
- **Cài đặt ngưỡng** linh hoạt

**Cách dùng:**
1. Click nút 💬 góc phải
2. Chat với AI
3. AI tự động cảnh báo

---

## 🔌 **BACKEND API ENDPOINTS**

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user

### Sessions
- `POST /api/sessions/start` - Bắt đầu session
- `POST /api/sessions/:id/end` - Kết thúc session
- `GET /api/sessions/active` - Session đang chạy

### Emotions
- `POST /api/emotions` - Lưu cảm xúc
- `GET /api/emotions` - Lịch sử cảm xúc
- `GET /api/emotions/distribution` - Phân bố cảm xúc

### Notes
- `POST /api/notes` - Tạo ghi chú
- `GET /api/notes` - Danh sách ghi chú
- `DELETE /api/notes/:id` - Xóa ghi chú

### Export
- `POST /api/exports` - Log export
- `GET /api/exports` - Lịch sử export

### Stats
- `POST /api/stats/daily` - Lưu stats hàng ngày
- `GET /api/stats/daily` - Lấy stats theo ngày
- `GET /api/stats/weekly` - Stats tuần

---

## 🎨 **GIAO DIỆN**

**Giữ nguyên 100%** giao diện gốc với:
- ✅ 4 tabs: Nhận Diện | Công Việc | Thống Kê | AI Trợ Lý
- ✅ Floating chat button
- ✅ Camera debug panel
- ✅ Responsive design
- ✅ Theme màu gradient đẹp

---

## 📊 **DỮ LIỆU LƯU TRỮ**

### Local Storage (Offline)
- Emotion history
- Work notes
- Pomodoro stats
- Settings

### Database (Online - khi đăng nhập)
- Users
- Sessions
- Emotions
- Notes
- Stats
- Export logs

**Auto-sync**: Mỗi 5 phút tự động đồng bộ lên database

---

## 🐛 **DEBUG & TROUBLESHOOTING**

### Kiểm tra hệ thống
Click nút "Debug" hoặc gõ trong Console:
```javascript
window.apiClient.healthCheck()
```

### Xem logs
```javascript
console.log('API Client:', window.apiClient);
console.log('Authenticated:', window.apiClient.isAuthenticated());
console.log('Current User:', window.apiClient.getCurrentUser());
```

### Test backend connection
```javascript
await window.apiClient.ping()
```

---

## 🔧 **CẤU HÌNH**

### Environment Variables (.env)
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
NODE_ENV=development
PORT=3000
```

### Database Schema
Schema đã chạy trên Neon PostgreSQL:
- ✅ Users table
- ✅ Work sessions table
- ✅ Emotions table
- ✅ Work notes table
- ✅ Productivity stats table
- ✅ Export logs table

---

## 📱 **SỬ DỤNG TRÊN ĐIỆN THOẠI**

1. Chạy server trên máy tính
2. Tìm IP của máy: `ipconfig` (Windows) hoặc `ifconfig` (Mac/Linux)
3. Truy cập: `http://YOUR_IP:3000`
4. Cho phép quyền camera trên điện thoại

---

## 💡 **TIPS**

1. **Đăng nhập để lưu dữ liệu lâu dài** - Không đăng nhập chỉ lưu local
2. **Export báo cáo thường xuyên** - PDF/CSV để backup
3. **Dùng Pomodoro** - Tăng hiệu suất làm việc
4. **Để AI Auto Mode ON** - Nhận cảnh báo tự động
5. **Kiểm tra Debug** - Khi có lỗi

---

## 🎯 **WORKFLOW KHUYÊN DÙNG**

1. **Sáng**: Đăng nhập → Bật camera → Start Pomodoro
2. **Trong ngày**: Thêm ghi chú công việc
3. **Tối**: Xem thống kê → Export báo cáo
4. **Cuối tuần**: Review weekly stats

---

## 🚨 **LƯU Ý**

- ✅ Camera cần HTTPS trên production (localhost OK)
- ✅ Backend cần môi trường Node.js 14+
- ✅ Database Neon PostgreSQL đã setup
- ✅ Tất cả chức năng hoạt động cả offline & online

---

## 📞 **HỖ TRỢ**

Gặp vấn đề? Kiểm tra:
1. Console (F12) để xem errors
2. Network tab để xem API calls
3. Click nút "Debug" trong app
4. Xem logs của server trong terminal

---

**Version**: 2.0 - Full Backend Integration  
**Last Updated**: November 20, 2025  
**Status**: ✅ Production Ready
