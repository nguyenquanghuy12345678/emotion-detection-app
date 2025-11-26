# 📘 HƯỚNG DẪN SỬ DỤNG - CAMERA REALTIME MODE

## 🎯 Tính năng

✅ **Auto-start khi phát hiện khuôn mặt** - Camera tự động bắt đầu tracking sau 2 giây  
✅ **Tracking realtime** - Lưu cảm xúc mỗi 10 giây vào Neon database  
✅ **Xác nhận dừng** - Bắt buộc xác nhận trước khi dừng phiên làm việc  
✅ **Timezone Việt Nam** - Tất cả timestamp sử dụng UTC+7 (Asia/Ho_Chi_Minh)

## 🚀 Bắt đầu sử dụng

### Bước 1: Đăng nhập

1. Mở http://localhost:3000
2. Click nút **"Đăng nhập"**
3. Nhập thông tin demo:
   - Email: `demo@example.com`
   - Password: `demo123`

### Bước 2: Camera tự động khởi động

Sau khi đăng nhập thành công:
- Camera sẽ **TỰ ĐỘNG** khởi động
- Màn hình hiển thị: "📹 Camera chờ - Di chuyển vào khung hình để bắt đầu"

### Bước 3: Di chuyển vào khung hình

- Ngồi vào trước camera
- Khi camera phát hiện khuôn mặt:
  - Hiển thị: "👤 Phát hiện người! Bắt đầu tracking sau 2 giây..."
  - Đếm ngược 2 giây

### Bước 4: Auto-start tracking

Sau 2 giây:
- ✅ Phiên làm việc **TỰ ĐỘNG** bắt đầu
- ✅ Cảm xúc được phát hiện và lưu **MỖI 10 GIÂY**
- ✅ Dữ liệu đồng bộ realtime lên Neon database
- Status: "✅ Đang tracking cảm xúc..."

### Bước 5: Làm việc bình thường

- Làm việc như bình thường
- AI sẽ tự động:
  - Phát hiện cảm xúc: happy, sad, angry, neutral, surprised, fearful, disgusted
  - Tính focus score (dựa vào cảm xúc neutral)
  - Lưu vào database mỗi 10 giây

### Bước 6: Dừng camera

Khi muốn dừng:
1. Click nút **"Stop Camera"**
2. Dialog xác nhận xuất hiện:
   ```
   🛑 Xác nhận dừng phiên làm việc?
   
   Dữ liệu sẽ được đồng bộ lên Neon database.
   Camera sẽ dừng và không cập nhật thông tin nữa.
   
   Bạn có chắc chắn?
   ```
3. Click **OK** để xác nhận
4. Hoặc **Cancel** để tiếp tục

### Bước 7: Hoàn thành

Sau khi xác nhận:
- ✅ Phiên làm việc kết thúc
- ✅ Duration tự động tính toán
- ✅ Camera dừng lại
- ✅ Alert: "✅ Dữ liệu đã được lưu vào Neon database!"

## 📊 Xem dữ liệu

### Trong Neon Console:

```sql
-- Xem phiên làm việc gần nhất
SELECT * FROM work_sessions 
ORDER BY start_time DESC 
LIMIT 5;

-- Xem cảm xúc được tracking
SELECT 
  emotion,
  confidence,
  focus_score,
  detected_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as vietnam_time
FROM emotion_history 
WHERE session_id = <session_id>
ORDER BY detected_at DESC;

-- Xem thống kê cảm xúc
SELECT 
  emotion,
  COUNT(*) as count,
  AVG(confidence) as avg_confidence
FROM emotion_history
WHERE session_id = <session_id>
GROUP BY emotion
ORDER BY count DESC;
```

## ⚙️ Cài đặt & Setup

### 1. Clone project
```bash
git clone <repo-url>
cd emotion-detection-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment
Tạo file `.env`:
```
DATABASE_URL=postgresql://user:password@host/database
PORT=3000
```

### 4. Init database
```bash
node scripts/init-db.js
```

Kết quả:
```
🗄️ Initializing Neon Database...
✅ Dropped old tables
✅ Created 4 tables: users, work_sessions, emotion_history, work_notes
✅ Created trigger for auto-calculating duration
✅ Created demo user: demo@example.com / password: demo123
🎉 Database ready! All timestamps in UTC+7 (Vietnam time)
```

### 5. Run server
```bash
node server.js
```

Server khởi động:
```
✅ Neon Database initialized
╔════════════════════════════════════════════════════════════╗
║   🎭  EMOTION DETECTION & PRODUCTIVITY TRACKER API        ║
║   Server:    http://localhost:3000                         ║
║   Database:  Neon PostgreSQL (Serverless)                 ║
║   Status:    ✅ Ready                                      ║
╚════════════════════════════════════════════════════════════╝
```

### 6. Mở browser
```
http://localhost:3000
```

## 🎯 Flow hoạt động tổng quan

```
1. Login → Camera auto-start
          ↓
2. Face detected → 2s countdown
          ↓
3. Auto-start session → Begin tracking
          ↓
4. Detect emotion every 10s → Save to Neon (realtime)
          ↓
5. User click Stop → Confirm dialog
          ↓
6. Confirmed → End session → Stop camera
          ↓
7. Data synced → Alert "Đã lưu vào Neon!"
```

## 📋 Lưu ý quan trọng

### ⚠️ Camera permissions
- Trình duyệt sẽ yêu cầu quyền truy cập camera
- Click **"Allow"** để sử dụng

### ⚠️ HTTPS requirement
- Camera chỉ hoạt động trên HTTPS hoặc localhost
- Production cần deploy với HTTPS

### ⚠️ Face detection
- Cần ánh sáng đủ để phát hiện khuôn mặt
- Không đeo khẩu trang kín mặt
- Nhìn thẳng vào camera

### ⚠️ Database timezone
- Tất cả timestamp đều UTC+7 (Việt Nam)
- Không cần convert timezone

## 🔧 Troubleshooting

### Camera không khởi động
- Kiểm tra quyền truy cập camera
- Kiểm tra camera có thiết bị khác đang dùng không
- Reload trang

### Không phát hiện khuôn mặt
- Di chuyển gần camera hơn
- Tăng ánh sáng
- Nhìn thẳng vào camera

### Database không lưu
- Kiểm tra DATABASE_URL trong .env
- Kiểm tra Neon database có online không
- Xem console log để debug

## ✨ Tính năng đã bỏ

❌ Export PDF/CSV - Đã xóa hoàn toàn  
❌ Manual start/stop - Giờ là auto-start  
❌ 4 tables thừa (export_history, productivity_stats, alert_logs, absence_logs)

## 🎉 Hoàn thành!

Giờ bạn có một hệ thống tracking cảm xúc realtime hoàn toàn tự động!

**Demo User**: demo@example.com / demo123  
**Server**: http://localhost:3000  
**Database**: Neon PostgreSQL (UTC+7)

📧 **Hỗ trợ**: Xem README.md để biết thêm chi tiết
