# 🔧 Database Fix - Complete Guide

## ❌ Vấn Đề Đã Phát Hiện

### 1. **Tên Column Không Khớp**
- `emotion_history`: Code dùng `emotion_id` & `detected_at` nhưng DB có `id` & `timestamp`
- `export_history`: Code dùng `exported_at` nhưng DB có `created_at`
- `work_notes`: Code dùng `note_id` nhưng DB có `id`

### 2. **API Insert Sai Bảng**
- `api/emotions/index.js` đang insert vào bảng `emotions` (không tồn tại)
- Phải insert vào `emotion_history`

### 3. **Data Type Không Khớp**
- `focus_score` phải là `INTEGER` không phải `DECIMAL`
- Frontend gửi số nguyên, DB expect decimal

### 4. **PDF Export Không Có Data**
- API `/productivity/stats` query column `timestamp` (không tồn tại)
- Phải query `detected_at`

### 5. **Note Hiển Thị "undefined"**
- Object có property `text` nhưng HTML render `note.note`

## ✅ Đã Sửa

### 1. **Schema Mới** (`database/schema-fixed.sql`)
```sql
CREATE TABLE emotion_history (
    emotion_id SERIAL PRIMARY KEY,  -- ✅ Changed from 'id'
    user_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    emotion VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    focus_score INTEGER DEFAULT 0,  -- ✅ Changed to INTEGER
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ✅ Changed from 'timestamp'
    CONSTRAINT valid_emotion CHECK (...)
);
```

### 2. **API Emotions Fixed** (`api/emotions/index.js`)
```javascript
// Before
INSERT INTO emotions (...)  // ❌ Table không tồn tại

// After
INSERT INTO emotion_history (  // ✅ Đúng tên bảng
    user_id, session_id, emotion, confidence, 
    focus_score, detected_at
) VALUES (...)
```

### 3. **API Productivity Stats Fixed** (`api/productivity/stats.js`)
```javascript
// Before
timestamp: e.timestamp  // ❌ Column không tồn tại

// After  
timestamp: e.detected_at  // ✅ Đúng column name
sessionId: e.session_id   // ✅ Thêm session ID
```

### 4. **Note Display Fixed** (`index.html`)
```javascript
// Before
${note.note}  // ❌ undefined

// After
${note.text || note.note || 'Ghi chú'}  // ✅ Fallback
```

### 5. **Sync Frequency Increased** (`js/app.js`)
```javascript
// Before
if (Date.now() - this.lastBackendSync > 10000)  // 10 giây

// After
if (Date.now() - this.lastBackendSync > 5000)   // 5 giây - nhiều data hơn
```

## 🚀 Cách Sửa Database

### Option 1: Database Mới (Recommended)

```bash
# 1. Xóa database cũ trong Neon (nếu không có data quan trọng)
# Vào Neon console > Database > Delete all tables

# 2. Chạy script init với schema mới
node init-database.js

# 3. Verify
node test-data-flow.js
```

### Option 2: Migrate Database Có Data

```bash
# 1. Chạy migration script để fix existing database
node migrate-database.js

# 2. Verify
node test-data-flow.js

# 3. Test app
node server.js
# Mở http://localhost:3000
```

## 📋 Các File Đã Thay Đổi

### Database Schema
- ✅ `database/schema-fixed.sql` - Schema mới 100% khớp với code
- ✅ `migrate-database.js` - Script migrate database có data
- ✅ `init-database.js` - Updated để dùng schema-fixed.sql
- ✅ `test-data-flow.js` - Script test data flow

### Backend API
- ✅ `api/emotions/index.js` - Fixed table name & column names
- ✅ `api/productivity/stats.js` - Fixed column `detected_at`

### Frontend
- ✅ `index.html` - Fixed note display `note.text`
- ✅ `js/app.js` - Increased sync frequency, added debug log

## 🧪 Testing Checklist

### 1. Database Structure
```bash
node test-data-flow.js
```

**Expected Output:**
```
✅ users
✅ work_sessions
✅ emotion_history  
✅ work_notes
✅ export_history
✅ productivity_stats
✅ alert_logs
✅ absence_logs

emotion_history columns:
   - emotion_id (integer)
   - user_id (integer)
   - session_id (integer)
   - emotion (character varying)
   - confidence (numeric)
   - focus_score (integer)
   - detected_at (timestamp)
```

### 2. Full User Flow

```bash
# Start server
node server.js
```

**Test Steps:**
1. ✅ Đăng ký: `test@example.com` / `test123` / `Nguyễn Văn A`
2. ✅ Đăng nhập
3. ✅ Start camera (Export buttons DISABLED)
4. ✅ Detect emotions (30 giây)
   - Check console: "💾 Saving emotion to backend..."
5. ✅ Stop camera (Export buttons ENABLED)
6. ✅ Thêm note: "Test note"
   - Check: Không hiển thị "undefined"
7. ✅ Xuất PDF
   - Check PDF có data thật
   - User: "Nguyễn Văn A"
   - Email: "test@example.com"
   - Có emotions chart
   - Có emotion history table

### 3. Database Verification

```sql
-- Connect to Neon database
psql $DATABASE_URL

-- Check user
SELECT * FROM users WHERE email = 'test@example.com';

-- Check session
SELECT * FROM work_sessions WHERE user_id = 1;

-- Check emotions
SELECT COUNT(*), AVG(focus_score), MIN(detected_at), MAX(detected_at)
FROM emotion_history 
WHERE session_id = 1;
-- Expected: COUNT > 0, AVG between 0-100

-- Check notes
SELECT note_text, created_at FROM work_notes WHERE user_id = 1;
-- Expected: "Test note"

-- Check exports
SELECT * FROM export_history WHERE user_id = 1;
-- Expected: 1 record with 'pdf'
```

## 🎯 Expected Results

### PDF Export Should Show:
```
NGUOI DUNG: Nguyễn Văn A
EMAIL: test@example.com
ID: 1

TONG QUAN:
Tổng thời gian làm việc: 0h 30phút  ✅ (not 0)
Điểm tập trung: 75/100  ✅ (not 0)
Cảm xúc ghi nhận: 6 loại  ✅ (not 0)

EMOTION CHART: ✅ Có pie chart
EMOTION HISTORY: ✅ Có table với ~6 rows
```

### Database Should Have:
```
users: 1 user
work_sessions: 1 session (with end_time filled)
emotion_history: ~6 records (5 second interval for 30 seconds)
work_notes: 1 note
export_history: 1 export log
```

## ⚠️ Common Issues

### Issue 1: "column timestamp does not exist"
**Fix**: Run migration
```bash
node migrate-database.js
```

### Issue 2: PDF still shows 0 data
**Diagnosis**:
```javascript
// Browser console
const token = localStorage.getItem('authToken');
fetch('/api/productivity/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

**Fix**: Check
- Session ID được tạo khi start camera?
- Emotions được lưu vào DB? (check terminal logs)
- API endpoint trả về data?

### Issue 3: Note vẫn hiển thị undefined
**Fix**: Clear localStorage và reload
```javascript
localStorage.clear();
location.reload();
```

## 📊 Database Schema Summary

### Core Tables (MUST HAVE)
1. ✅ **users** - Authentication
2. ✅ **work_sessions** - Track working sessions  
3. ✅ **emotion_history** - Store detected emotions
4. ✅ **work_notes** - User notes
5. ✅ **export_history** - Export logs

### Optional Tables (Nice to have)
6. 🔄 **productivity_stats** - Daily aggregation (not actively used yet)
7. 🔄 **alert_logs** - AI assistant alerts (not actively used yet)
8. 🔄 **absence_logs** - Away tracking (not actively used yet)

## ✅ Success Criteria

- [x] Database schema khớp 100% với code
- [x] API insert vào đúng bảng
- [x] API query đúng column names
- [x] Note hiển thị text (không undefined)
- [x] PDF export có data thật
- [x] Session ID được track đúng
- [x] Focus score lưu dạng INTEGER
- [x] Export buttons chỉ enable khi đúng điều kiện

---

**Last Updated**: November 25, 2025  
**Version**: 2.2 - Database Schema Fixed
