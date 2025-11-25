# 🎭 Hướng Dẫn Sử Dụng - Emotion Detection & Productivity Tracker

## ✅ Đã Fix Xong

### 1. Database - Tất cả bảng đã được tạo
```
✅ users                 - Quản lý người dùng
✅ work_sessions          - Phiên làm việc
✅ emotion_history        - Lịch sử cảm xúc
✅ productivity_stats     - Thống kê năng suất
✅ work_notes             - Ghi chú công việc
✅ alert_logs             - Nhật ký cảnh báo
✅ absence_logs           - Theo dõi vắng mặt
✅ export_history         - Lịch sử xuất báo cáo
```

### 2. Database Error Fixes
- ✅ Fix lỗi `focus_score` INTEGER vs Float - Đã làm tròn trong `server.js`
- ✅ Emotions giờ lưu thành công vào database
- ✅ Tất cả API endpoints hoạt động ổn định

### 3. PDF Export - Báo Cáo Chuyên Nghiệp
- ✅ Font tiếng Việt hiển thị đẹp
- ✅ Layout chuyên nghiệp với header gradient
- ✅ Bảng thống kê chi tiết đầy đủ
- ✅ Phân bố cảm xúc với biểu đồ bar
- ✅ Lịch sử cảm xúc 10 record gần nhất
- ✅ Nhận xét & đề xuất thông minh
- ✅ Footer với số trang
- ✅ File tự động đặt tên theo ngày giờ

## 🚀 Cách Sử Dụng

### Bước 1: Khởi động Server
```powershell
cd d:\CODE_WORD\emotion-detection-app
node server.js
```

### Bước 2: Mở Browser
```
http://localhost:3000
```

### Bước 3: Đăng Ký/Đăng Nhập
1. Click nút "🔐 Đăng nhập" trên Guest Mode Bar
2. Chọn "Đăng ký ngay" nếu chưa có tài khoản
3. Điền thông tin và đăng ký
4. Hoặc đăng nhập với tài khoản demo:
   - Email: `demo@emotiontracker.com`
   - Password: `demo123`

### Bước 4: Bắt Đầu Session
1. Click "▶ Bắt Đầu" để bắt đầu phiên làm việc
2. Cho phép camera để nhận diện cảm xúc
3. Hệ thống sẽ tự động:
   - Nhận diện cảm xúc mỗi 10 giây
   - Tính điểm tập trung
   - Lưu vào database

### Bước 5: Làm Việc & Theo Dõi
- 🎭 **Tab Nhận Diện Cảm Xúc**: Xem cảm xúc realtime
- 💼 **Tab Hỗ Trợ Công Việc**: Pomodoro timer, ghi chú
- 📊 **Tab Thống Kê**: Xem biểu đồ, thống kê
- 🤖 **Tab AI Trợ Lý**: Chat với AI

### Bước 6: Xuất Báo Cáo
1. Vào tab **Hỗ Trợ Công Việc**
2. Click "📄 Xuất PDF" hoặc "📊 Xuất CSV"
3. File tự động download với tên:
   - PDF: `BaoCao_NangSuat_YYYYMMDD_HHMM.pdf`
   - CSV: `emotions-timestamp.csv`

## 📊 Nội Dung Báo Cáo PDF

### 1. Header
- Tiêu đề: "BÁO CÁO NĂNG SUẤT LÀM VIỆC"
- Thông tin người dùng, ngày tháng

### 2. Tổng Quan
- Tổng thời gian làm việc
- Điểm tập trung
- Tỷ lệ tập trung
- Pomodoro hoàn thành
- Cảm xúc ghi nhận

### 3. Thống Kê Chi Tiết (Bảng)
- Tổng thời gian
- Thời gian tập trung
- Thời gian mất tập trung
- Thời gian vui vẻ
- Thời gian căng thẳng
- Thời gian nghỉ

### 4. Phân Bố Cảm Xúc (Bảng + Bar Chart)
- Emoji + Tên cảm xúc
- Số lần xuất hiện
- Tỷ lệ %
- Biểu đồ bar ASCII

### 5. Nhận Xét & Đề Xuất
Hệ thống AI phân tích và đưa ra:
- Đánh giá tỷ lệ tập trung
- Cảnh báo thời gian làm việc quá dài
- Đề xuất kỹ thuật Pomodoro
- Phân tích tình trạng căng thẳng
- Gợi ý cải thiện môi trường làm việc

### 6. Lịch Sử Cảm Xúc (10 record gần nhất)
- Thời gian
- Cảm xúc + emoji
- Độ tin cậy
- Điểm tập trung

### 7. Footer
- Số trang
- Thông tin hệ thống

## 🎯 API Endpoints

### Authentication
```
POST /api/auth/register    - Đăng ký
POST /api/auth/login       - Đăng nhập
GET  /api/auth/me          - Lấy thông tin user
```

### Sessions
```
POST /api/sessions/start   - Bắt đầu session
POST /api/sessions/end     - Kết thúc session
GET  /api/sessions/active  - Lấy session đang chạy
```

### Emotions
```
POST /api/emotions         - Lưu emotion
GET  /api/emotions         - Lấy lịch sử emotion
```

### Stats
```
POST /api/stats/daily      - Lưu thống kê ngày
GET  /api/stats/daily      - Lấy thống kê ngày
GET  /api/stats/weekly     - Lấy thống kê tuần
```

### Notes
```
POST /api/notes            - Tạo ghi chú
GET  /api/notes            - Lấy danh sách ghi chú
DELETE /api/notes/:id      - Xóa ghi chú
```

### Export
```
GET  /api/exports          - Lịch sử export
```

## 🐛 Troubleshooting

### Lỗi: Emotion không lưu
**Giải pháp**: Đã fix! focusScore giờ được làm tròn trước khi lưu.

### Lỗi: PDF không có tiếng Việt
**Giải pháp**: Sử dụng Professional Export Service mới với Helvetica font.

### Lỗi: Thiếu bảng trong database
**Giải pháp**: Chạy `node init-database.js` để tạo tất cả bảng.

### Lỗi: Bảng đã tồn tại
**Giải pháp**: Không sao, script sẽ skip và tiếp tục.

## 📝 Database Initialization

Nếu cần tạo lại database:

```powershell
node init-database.js
```

Kết quả:
```
✅ Successful: 8
📋 Created tables: 8 tables
📊 Created views: 3 views
👤 Demo user: demo@emotiontracker.com
```

## 🔒 Demo Account

- Email: `demo@emotiontracker.com`
- Password: `demo123`

## 📦 File Structure

```
emotion-detection-app/
├── server.js                          # Express server
├── init-database.js                   # Database initialization script
├── index.html                         # Main app
├── database/
│   ├── database.js                    # Database operations
│   └── schema.sql                     # Complete schema
├── js/
│   ├── api-client.js                  # API client
│   ├── export-service.js              # Old export service
│   ├── export-service-pro.js          # NEW Professional export
│   ├── productivity.js                # Productivity tracker
│   └── ...
└── api/
    ├── auth/                          # Authentication routes
    ├── emotions/                      # Emotion routes
    ├── sessions/                      # Session routes
    ├── stats/                         # Stats routes
    └── notes/                         # Notes routes
```

## ✨ Tính Năng Mới

1. **Database Hoàn Chỉnh**
   - 8 bảng chính
   - 3 views tổng hợp
   - Triggers tự động update timestamp

2. **PDF Export Chuyên Nghiệp**
   - Header gradient đẹp
   - Bảng dữ liệu chi tiết
   - Biểu đồ bar ASCII
   - Phân tích AI thông minh
   - Footer với pagination

3. **Emotion Tracking Ổn Định**
   - Lưu thành công vào database
   - Không còn lỗi type mismatch
   - Realtime tracking mượt mà

4. **Recommendations AI**
   - Đánh giá tỷ lệ tập trung
   - Cảnh báo làm việc quá sức
   - Đề xuất kỹ thuật Pomodoro
   - Phân tích cảm xúc và stress

---

**Developed with ❤️ by GitHub Copilot**
**Version**: 2.0 Professional
**Date**: November 20, 2025
