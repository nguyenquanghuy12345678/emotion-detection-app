# 🔒 Export Authentication Feature

## Tổng Quan

Tính năng xuất báo cáo (PDF/CSV) đã được cập nhật để yêu cầu:
1. **Người dùng phải đăng nhập** vào hệ thống
2. **Phiên làm việc phải kết thúc** (camera detection đã dừng)

## 🎯 Lý Do

### Bảo Mật Dữ Liệu
- Guest mode không nên có quyền xuất báo cáo vì dữ liệu không được lưu trữ lâu dài
- Chỉ người dùng đã xác thực mới có quyền truy cập dữ liệu từ database

### Tính Toàn Vẹn Dữ Liệu
- Xuất báo cáo khi phiên đang chạy có thể dẫn đến dữ liệu không đầy đủ
- Đảm bảo tất cả cảm xúc đã được ghi nhận trước khi xuất

### Tracking & Audit
- Mọi lần xuất báo cáo đều được ghi log vào database
- Có thể theo dõi ai đã xuất báo cáo và khi nào

## 📋 Quy Trình Sử Dụng

### Bước 1: Đăng Nhập
```
1. Nhấn "Đăng nhập" hoặc "Đăng ký"
2. Nhập thông tin
3. Đăng nhập thành công
   ✅ Hiển thị: "Xin chào, [Tên]"
```

### Bước 2: Làm Việc
```
1. Nhấn "Bắt Đầu" để bật camera
2. Làm việc và track emotions
   ⚠️ Nút "Xuất PDF" và "Xuất CSV" bị DISABLED
   💡 Tooltip: "Vui lòng kết thúc phiên làm việc trước"
```

### Bước 3: Kết Thúc Phiên
```
1. Nhấn "Dừng" để kết thúc camera detection
   ✅ Dữ liệu được lưu vào database
   ✅ Session kết thúc
```

### Bước 4: Xuất Báo Cáo
```
1. Nút "Xuất PDF" và "Xuất CSV" được ENABLED
2. Nhấn để xuất báo cáo
3. Báo cáo chứa:
   - Tên thật: [Full Name]
   - Email: [Your Email]
   - User ID: [Your ID]
   - Toàn bộ dữ liệu từ database Neon
4. Export được log vào bảng `export_history`
```

## 🔐 Trạng Thái Nút Export

### ❌ DISABLED (Không Thể Xuất)

**Trường hợp 1: Chưa đăng nhập**
```
Trạng thái: Guest Mode
Nút: DISABLED (màu xám)
Tooltip: "Vui lòng đăng nhập để xuất báo cáo"
Lý do: Không có dữ liệu trong database
```

**Trường hợp 2: Đã đăng nhập nhưng đang chạy camera**
```
Trạng thái: Session đang active
Nút: DISABLED (màu xám)
Tooltip: "Vui lòng kết thúc phiên làm việc trước"
Lý do: Dữ liệu chưa hoàn chỉnh
```

### ✅ ENABLED (Có Thể Xuất)

**Trường hợp: Đã đăng nhập và đã kết thúc phiên**
```
Trạng thái: Logged in + Session ended
Nút: ENABLED (màu tím)
Tooltip: "Xuất báo cáo PDF" / "Xuất dữ liệu CSV"
Hành động: Click để xuất
```

## 💻 Technical Implementation

### Frontend Logic

```javascript
function updateExportButtons() {
    const isAuthenticated = window.apiClient && window.apiClient.isAuthenticated();
    const isSessionActive = window.emotionApp && window.emotionApp.isRunning;
    
    if (!isAuthenticated) {
        // Disable - not logged in
        exportBtn.disabled = true;
    } else if (isSessionActive) {
        // Disable - session running
        exportBtn.disabled = true;
    } else {
        // Enable - ready to export
        exportBtn.disabled = false;
    }
}
```

### Export Function

```javascript
async function exportProductivityReport(type = 'pdf') {
    // Check 1: Authentication
    if (!window.apiClient || !window.apiClient.isAuthenticated()) {
        alert('⚠️ Vui lòng đăng nhập để xuất báo cáo!');
        showAuthModal();
        return;
    }

    // Check 2: Session ended
    if (window.emotionApp && window.emotionApp.isRunning) {
        alert('⚠️ Vui lòng kết thúc phiên làm việc trước!');
        return;
    }

    // Proceed with export...
}
```

### Button State Updates

**Được gọi khi:**
1. Page load (`DOMContentLoaded`)
2. Login thành công (`handleLogin`)
3. Register thành công (`handleRegister`)
4. Logout (`handleLogout`)
5. Start camera detection (`app.start()`)
6. Stop camera detection (`app.stop()`)

## 🗄️ Database Logging

Mỗi lần xuất báo cáo thành công, một record được tạo trong `export_history`:

```sql
INSERT INTO export_history (user_id, export_type, file_name, exported_at)
VALUES (1, 'pdf', 'Productivity_Report_User_20251125.pdf', NOW());
```

### Xem Lịch Sử Export

```sql
SELECT 
    export_id,
    export_type,
    file_name,
    exported_at
FROM export_history
WHERE user_id = 1
ORDER BY exported_at DESC
LIMIT 10;
```

## 📊 User Flow Diagram

```
┌─────────────────┐
│  Open App       │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Guest? │──Yes──► Show "Đăng nhập" button
    └───┬────┘         Export buttons DISABLED
        │
        No (Logged in)
        │
        ▼
    ┌──────────────┐
    │ Start Camera │──► Export buttons DISABLED
    └──────┬───────┘    (Session active)
           │
           ▼
    ┌──────────────┐
    │ Detect       │
    │ Emotions     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Stop Camera  │──► Export buttons ENABLED
    └──────┬───────┘    (Session ended)
           │
           ▼
    ┌──────────────┐
    │ Click Export │──► Generate PDF/CSV
    └──────┬───────┘    Log to database
           │
           ▼
    ┌──────────────┐
    │ Download     │
    │ Report       │
    └──────────────┘
```

## 🧪 Testing

### Test Case 1: Guest Mode
```
1. Open app without login
2. Check export buttons → Should be DISABLED
3. Try to click → No action or show login modal
```

### Test Case 2: Logged In, Session Running
```
1. Login
2. Start camera detection
3. Check export buttons → Should be DISABLED
4. Tooltip → "Vui lòng kết thúc phiên làm việc trước"
```

### Test Case 3: Logged In, Session Ended
```
1. Login
2. Start camera detection
3. Stop camera detection
4. Check export buttons → Should be ENABLED
5. Click export → Should work
6. Check database → export_history should have new record
```

### Test Case 4: Login/Logout State Change
```
1. Start as guest → Export DISABLED
2. Login → Export still DISABLED (no session yet)
3. Start & stop camera → Export ENABLED
4. Logout → Export DISABLED again
```

## 🐛 Troubleshooting

### Problem: Nút export vẫn enabled khi chưa login

**Diagnosis:**
```javascript
console.log(window.apiClient.isAuthenticated()); // Should be false
```

**Fix:**
```javascript
updateExportButtons(); // Re-run state update
```

### Problem: Nút export không enable sau khi dừng camera

**Diagnosis:**
```javascript
console.log(window.emotionApp.isRunning); // Should be false
```

**Fix:**
- Check `app.stop()` is setting `isRunning = false`
- Check `updateExportButtons()` is being called in `stop()`

### Problem: Export không log vào database

**Diagnosis:**
```javascript
// Check token
console.log(localStorage.getItem('authToken'));

// Check API response
const response = await fetch('/api/exports', {...});
console.log(await response.json());
```

**Fix:**
- Verify token is valid
- Check `/api/exports` endpoint is working
- Check database connection

## 📝 Summary

### ✅ Được Phép Xuất Khi:
- ✅ Đã đăng nhập
- ✅ Camera đã dừng (session ended)
- ✅ Có dữ liệu trong database

### ❌ KHÔNG Được Xuất Khi:
- ❌ Chưa đăng nhập (Guest mode)
- ❌ Camera đang chạy (session active)
- ❌ Không có dữ liệu

### 🎯 Lợi Ích:
1. **Bảo mật**: Chỉ user xác thực mới xuất được
2. **Toàn vẹn**: Dữ liệu đầy đủ trước khi xuất
3. **Audit**: Tracking đầy đủ trong database
4. **UX**: Clear feedback về trạng thái nút

---

**Last Updated**: November 25, 2025  
**Version**: 2.1 - Export Authentication Required
