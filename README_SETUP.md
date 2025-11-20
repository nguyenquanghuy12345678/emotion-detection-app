# 🚀 HƯỚNG DẪN CÀI ĐẶT - EMOTION DETECTION & PRODUCTIVITY TRACKER

## 📋 Mục Lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt Neon Database](#cài-đặt-neon-database)
3. [Cấu hình Backend](#cấu-hình-backend)
4. [Chạy ứng dụng](#chạy-ứng-dụng)
5. [Sử dụng tính năng](#sử-dụng-tính-năng)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Yêu cầu hệ thống

- **Node.js** >= 16.x
- **npm** hoặc **yarn**
- **Trình duyệt** hỗ trợ WebRTC (Chrome, Edge, Firefox)
- **Camera** (cho tính năng nhận diện cảm xúc)
- **Kết nối Internet** (cho database và CDN)

---

## 🗄️ Cài đặt Neon Database

### Bước 1: Tạo tài khoản Neon

1. Truy cập [https://neon.tech](https://neon.tech)
2. Đăng ký tài khoản miễn phí (Free Tier)
3. Xác nhận email

### Bước 2: Tạo Project mới

1. Đăng nhập vào Neon Dashboard
2. Click **"Create a project"**
3. Điền thông tin:
   - **Project name**: `emotion-tracker` (hoặc tên bạn muốn)
   - **Region**: Chọn region gần bạn nhất (ví dụ: Singapore)
   - **PostgreSQL version**: 15 (recommended)
4. Click **"Create project"**

### Bước 3: Lấy Connection String

1. Sau khi tạo project, copy **Connection String**
2. Format sẽ giống như:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Lưu lại string này, bạn sẽ cần nó ở bước sau

### Bước 4: Chạy Database Schema

1. Truy cập **SQL Editor** trong Neon Dashboard
2. Copy toàn bộ nội dung file `database/schema.sql`
3. Paste vào SQL Editor và click **"Run"**
4. Kiểm tra các bảng đã được tạo thành công

**Hoặc sử dụng CLI:**

```bash
# Cài đặt Neon CLI (optional)
npm install -g neonctl

# Chạy schema
psql "YOUR_DATABASE_URL" -f database/schema.sql
```

---

## ⚙️ Cấu hình Backend

### Bước 1: Clone Repository

```bash
git clone https://github.com/nguyenquanghuy12345678/emotion-detection-app.git
cd emotion-detection-app
```

### Bước 2: Cài đặt Dependencies

```bash
npm install
```

Packages sẽ được cài đặt:
- `@neondatabase/serverless` - Neon PostgreSQL client
- `express` - Web framework
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `jspdf` + `jspdf-autotable` - PDF export
- `papaparse` - CSV export
- `cors` - CORS middleware
- `dotenv` - Environment variables

### Bước 3: Tạo file .env

```bash
# Copy file example
cp .env.example .env
```

Mở file `.env` và điền thông tin:

```env
# Paste Connection String từ Neon
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require

# Tạo JWT Secret (random string ít nhất 32 ký tự)
JWT_SECRET=abc123xyz789-your-super-secret-key-min-32-chars

# Port server (mặc định 3000)
PORT=3000

# Environment
NODE_ENV=development
```

**⚠️ LƯU Ý:**
- **KHÔNG** commit file `.env` lên Git
- Đổi `JWT_SECRET` thành chuỗi ngẫu nhiên mạnh
- Sử dụng Connection String từ Neon, không dùng string mẫu

### Bước 4: Kiểm tra kết nối

```bash
node -e "require('./database/database').healthCheck().then(r => console.log(r))"
```

Nếu thành công, bạn sẽ thấy:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "...",
  "version": "PostgreSQL 15..."
}
```

---

## 🚀 Chạy ứng dụng

### Development Mode (2 terminals)

**Terminal 1 - Backend API:**
```bash
npm run dev
```

Output:
```
╔════════════════════════════════════════════════════════════╗
║   🎭  EMOTION DETECTION & PRODUCTIVITY TRACKER API        ║
║   Server:    http://localhost:3000                        ║
║   Database:  Neon PostgreSQL (Serverless)                 ║
║   Status:    ✅ Ready                                      ║
╚════════════════════════════════════════════════════════════╝
```

**Terminal 2 - Frontend Client:**
```bash
npm run client
```

Output:
```
Starting up http-server...
Available on:
  http://127.0.0.1:8080
  http://192.168.x.x:8080
```

### Production Mode

```bash
# Build và chạy cả frontend + backend
npm start
```

Truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🎯 Sử dụng tính năng

### 1. Đăng ký / Đăng nhập

1. Mở trình duyệt tại `http://localhost:8080`
2. Click **"Đăng ký"** (nếu chưa có tài khoản)
3. Điền:
   - Email
   - Password (ít nhất 6 ký tự)
   - Họ tên (optional)
4. Click **"Đăng nhập"** với tài khoản đã tạo

**Tài khoản demo:**
- Email: `demo@emotiontracker.com`
- Password: `demo123`

### 2. Nhận diện cảm xúc

1. Click **"Thiết lập Camera"** và cho phép truy cập
2. Click **"Bắt Đầu"**
3. Ứng dụng sẽ nhận diện cảm xúc realtime
4. Dữ liệu tự động sync lên database

### 3. Theo dõi năng suất

1. Tab **"Hỗ Trợ Công Việc"**:
   - Xem trạng thái làm việc
   - Sử dụng Pomodoro Timer
   - Thêm ghi chú công việc

2. Tab **"Thống Kê"**:
   - Xem biểu đồ cảm xúc
   - Phân tích năng suất
   - Timeline lịch sử

### 4. Export báo cáo

**Export PDF:**
```javascript
// Mở Console (F12) và chạy:
const data = exportService.prepareExportData(productivityTracker);
exportService.exportToPDF(data, {
  title: 'Báo Cáo Năng Suất Tuần',
  userName: 'Your Name',
  dateRange: '14/11 - 20/11/2025'
});
```

**Export CSV:**
```javascript
const data = exportService.prepareExportData(productivityTracker);
exportService.exportToCSV(data, { type: 'summary' });
```

**Hoặc sử dụng UI:**
- Tab **"Hỗ Trợ Công Việc"** > **"Xuất báo cáo"**

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user

### Sessions
- `POST /api/sessions/start` - Bắt đầu session
- `POST /api/sessions/:id/end` - Kết thúc session
- `GET /api/sessions` - Lấy danh sách sessions
- `GET /api/sessions/active` - Lấy session đang chạy

### Emotions
- `POST /api/emotions` - Lưu cảm xúc
- `GET /api/emotions` - Lấy lịch sử cảm xúc
- `GET /api/emotions/distribution` - Phân bố cảm xúc

### Stats
- `POST /api/stats/daily` - Cập nhật stats hằng ngày
- `GET /api/stats/daily` - Lấy stats ngày
- `GET /api/stats/range` - Lấy stats theo khoảng
- `GET /api/stats/weekly` - Stats tuần

### Notes
- `POST /api/notes` - Tạo ghi chú
- `GET /api/notes` - Lấy ghi chú
- `DELETE /api/notes/:id` - Xóa ghi chú

### Dashboard
- `GET /api/dashboard` - Tổng quan dashboard

### Exports
- `POST /api/exports` - Log export
- `GET /api/exports` - Lịch sử export

### Health
- `GET /api/health` - Kiểm tra server
- `GET /api/ping` - Ping test

**Xem chi tiết:** [API Documentation](./README_API.md)

---

## 🔧 Troubleshooting

### 1. Lỗi "Cannot connect to database"

**Nguyên nhân:**
- Connection string sai
- Neon database chưa khởi động
- Firewall chặn kết nối

**Giải pháp:**
```bash
# Kiểm tra connection string
echo $DATABASE_URL

# Test kết nối
psql "$DATABASE_URL" -c "SELECT NOW();"

# Kiểm tra schema
psql "$DATABASE_URL" -c "\dt"
```

### 2. Lỗi "Face-API not loaded"

**Nguyên nhân:**
- CDN bị chặn
- Mạng chậm

**Giải pháp:**
- Chờ 30-60 giây cho CDN load
- Thử trình duyệt khác
- Check DevTools Console (F12)

### 3. Lỗi "Camera not accessible"

**Nguyên nhân:**
- Chưa cho phép truy cập camera
- Camera đang được dùng bởi app khác
- Chạy không phải HTTPS (localhost OK)

**Giải pháp:**
- Click cho phép camera khi browser hỏi
- Đóng Zoom, Teams, hoặc app dùng camera
- Dùng localhost hoặc HTTPS

### 4. Lỗi "Token expired"

**Giải pháp:**
```javascript
// Đăng xuất và đăng nhập lại
apiClient.logout();
```

### 5. Export PDF/CSV không hoạt động

**Kiểm tra:**
```javascript
// Mở Console (F12)
console.log('jsPDF loaded:', typeof jsPDF !== 'undefined');
console.log('PapaParse loaded:', typeof Papa !== 'undefined');
```

**Giải pháp:**
```html
<!-- Thêm vào index.html nếu thiếu -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
```

### 6. Auto-sync không hoạt động

**Kiểm tra:**
```javascript
// Console
console.log('Auto-sync running:', !!apiClient.syncInterval);
console.log('Authenticated:', apiClient.isAuthenticated());
```

**Bật auto-sync:**
```javascript
apiClient.startAutoSync(5); // Sync mỗi 5 phút
```

---

## 🔒 Bảo mật

### Production Checklist

- [ ] Đổi `JWT_SECRET` thành chuỗi mạnh (32+ chars)
- [ ] Sử dụng HTTPS
- [ ] Giới hạn CORS origins
- [ ] Rate limiting cho API
- [ ] Backup database định kỳ
- [ ] Monitor logs
- [ ] Cập nhật dependencies

### Environment Variables

```env
# Production
NODE_ENV=production
JWT_SECRET=<strong-random-string-min-32-chars>
DATABASE_URL=<neon-connection-string>
CORS_ORIGIN=https://yourdomain.com
```

---

## 📝 Deployment

### Deploy lên Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy production
vercel --prod
```

### Environment Variables trên Vercel

1. Vercel Dashboard > Project Settings > Environment Variables
2. Thêm:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/nguyenquanghuy12345678/emotion-detection-app/issues)
- **Email:** support@emotiontracker.com
- **Docs:** [Full Documentation](./README.md)

---

## 📄 License

MIT License - Xem [LICENSE](./LICENSE)

---

**🎉 Chúc bạn sử dụng thành công!**
