# 📊 Luồng Xuất Báo Cáo PDF

## Tổng quan

Ứng dụng đã được cập nhật để **chỉ cho phép xuất báo cáo PDF sau khi kết thúc phiên làm việc**. Điều này đảm bảo dữ liệu được hoàn chỉnh và chính xác trước khi xuất.

## Luồng hoạt động

### 1. Trạng thái ban đầu
```
┌─────────────────────────────────────────┐
│  Chưa đăng nhập                         │
│  ❌ Nút "Xuất PDF" bị vô hiệu hóa       │
│  Tooltip: "Vui lòng đăng nhập..."       │
└─────────────────────────────────────────┘
```

### 2. Sau khi đăng nhập
```
┌─────────────────────────────────────────┐
│  Đã đăng nhập                           │
│  ❌ Nút "Xuất PDF" vẫn bị vô hiệu hóa   │
│  (Chưa có phiên làm việc)               │
└─────────────────────────────────────────┘
```

### 3. Trong phiên làm việc (Camera đang chạy)
```
┌─────────────────────────────────────────┐
│  Đã đăng nhập + Camera đang chạy        │
│  ❌ Nút "Xuất PDF" bị vô hiệu hóa       │
│  Tooltip: "Vui lòng kết thúc phiên..."  │
└─────────────────────────────────────────┘
```

### 4. Sau khi kết thúc phiên làm việc
```
┌─────────────────────────────────────────┐
│  Đã đăng nhập + Camera đã dừng          │
│  ✅ Nút "Xuất PDF" được kích hoạt       │
│  💬 Hiển thị popup thông báo            │
│     "Phiên làm việc đã kết thúc!"       │
│     "Bạn có thể xuất báo cáo PDF..."    │
└─────────────────────────────────────────┘
```

## Điều kiện để xuất PDF

### Điều kiện bắt buộc:

1. ✅ **Đã đăng nhập** vào hệ thống
2. ✅ **Camera đã dừng** (phiên làm việc đã kết thúc)

### Kiểm tra trong code:

```javascript
// Trong hàm exportProductivityReport()
if (!window.apiClient || !window.apiClient.isAuthenticated()) {
    alert('⚠️ Vui lòng đăng nhập để xuất báo cáo!');
    return;
}

if (window.emotionApp && window.emotionApp.isRunning) {
    alert('⚠️ Vui lòng kết thúc phiên làm việc trước khi xuất báo cáo!');
    return;
}
```

## Thông báo kết thúc phiên

Khi người dùng nhấn nút **"Dừng"** để kết thúc phiên làm việc, một popup đẹp mắt sẽ xuất hiện với:

### Nội dung popup:
- 🎉 Icon ăn mừng
- **Tiêu đề**: "Phiên làm việc đã kết thúc!"
- **Thông tin**:
  - Thời lượng làm việc (giờ, phút, giây)
  - Điểm tập trung (0-100)
- **Gợi ý**: "✨ Bạn có thể xuất báo cáo PDF ngay bây giờ!"
- **Nút hành động**:
  - 📄 "Xuất PDF ngay" - Xuất báo cáo trực tiếp
  - "Đóng" - Đóng popup

### Đặc điểm popup:
- Xuất hiện giữa màn hình với hiệu ứng slide-in
- Tự động đóng sau 10 giây
- Có thể đóng thủ công bằng nút "Đóng"
- Thiết kế gradient đẹp mắt (purple/blue)

## Ghi chú hiển thị

Trong phần **Quick Actions**, có ghi chú rõ ràng:

```
⚠️ Chỉ có thể xuất báo cáo khi:
  • Đã đăng nhập vào hệ thống
  • Đã kết thúc phiên làm việc (camera đã dừng)
```

## Cập nhật trạng thái nút

Hàm `updateExportButtons()` được gọi tự động khi:
- Người dùng đăng nhập/đăng xuất
- Phiên làm việc bắt đầu
- **Phiên làm việc kết thúc** ← MỚI

```javascript
// Trong ProductivityTracker.endSession()
if (typeof updateExportButtons === 'function') {
    updateExportButtons();
}
```

## Trải nghiệm người dùng

### Kịch bản thông thường:

1. **Đăng nhập** → Nút PDF vẫn tắt
2. **Nhấn "Bắt đầu"** → Camera chạy, nút PDF vẫn tắt
3. **Làm việc** → Ứng dụng ghi nhận cảm xúc
4. **Nhấn "Dừng"** → 
   - Popup xuất hiện thông báo kết thúc
   - Nút PDF được bật
   - Có thể xuất ngay từ popup hoặc sau này

### Lợi ích:

✅ **Dữ liệu đầy đủ**: Đảm bảo phiên làm việc hoàn chỉnh trước khi xuất
✅ **UX tốt**: Popup gợi ý rõ ràng, không bắt buộc xuất ngay
✅ **Linh hoạt**: Có thể xuất ngay hoặc để sau
✅ **Rõ ràng**: Ghi chú và tooltip giải thích rõ điều kiện

## Testing

### Test case 1: Chưa đăng nhập
```
1. Mở ứng dụng (chưa đăng nhập)
2. Kiểm tra nút "Xuất PDF"
   ✅ Expected: Nút bị vô hiệu hóa
   ✅ Expected: Tooltip hiển thị "Vui lòng đăng nhập..."
```

### Test case 2: Đã đăng nhập, chưa có phiên
```
1. Đăng nhập
2. Chưa nhấn "Bắt đầu"
3. Kiểm tra nút "Xuất PDF"
   ✅ Expected: Nút bị vô hiệu hóa
```

### Test case 3: Trong phiên làm việc
```
1. Đăng nhập
2. Nhấn "Bắt đầu" camera
3. Kiểm tra nút "Xuất PDF"
   ✅ Expected: Nút bị vô hiệu hóa
   ✅ Expected: Tooltip "Vui lòng kết thúc phiên..."
4. Thử click nút "Xuất PDF"
   ✅ Expected: Alert xuất hiện thông báo phải dừng camera
```

### Test case 4: Kết thúc phiên làm việc
```
1. Đăng nhập
2. Nhấn "Bắt đầu" camera
3. Làm việc một lúc
4. Nhấn "Dừng"
   ✅ Expected: Popup xuất hiện với thông tin phiên
   ✅ Expected: Hiển thị thời lượng và điểm tập trung
   ✅ Expected: Có nút "Xuất PDF ngay"
   ✅ Expected: Popup tự đóng sau 10 giây
5. Kiểm tra nút "Xuất PDF" ở sidebar
   ✅ Expected: Nút được kích hoạt
6. Click nút "Xuất PDF"
   ✅ Expected: Báo cáo PDF được tạo và tải xuống
```

### Test case 5: Popup xuất PDF ngay
```
1. Kết thúc phiên làm việc
2. Popup xuất hiện
3. Click "Xuất PDF ngay" trong popup
   ✅ Expected: PDF được tạo ngay lập tức
   ✅ Expected: Popup đóng
```

## Code liên quan

### Files đã sửa đổi:

1. **`js/productivity.js`**
   - Thêm hàm `showSessionEndNotification()`
   - Cập nhật hàm `endSession()` để hiển thị popup

2. **`index.html`**
   - Đã có logic `updateExportButtons()`
   - Đã có kiểm tra trong `exportProductivityReport()`
   - Đã có ghi chú trong UI

### Functions quan trọng:

```javascript
// productivity.js
endSession() {
    // ... kết thúc phiên
    this.showSessionEndNotification(sessionDuration);
    if (typeof updateExportButtons === 'function') {
        updateExportButtons();
    }
}

showSessionEndNotification(sessionDuration) {
    // Tạo và hiển thị popup đẹp
}

// index.html
updateExportButtons() {
    // Cập nhật trạng thái enable/disable
}

exportProductivityReport(type) {
    // Kiểm tra điều kiện trước khi xuất
}
```

## Troubleshooting

### Vấn đề: Nút PDF không bật sau khi dừng camera
**Giải pháp**: 
- Kiểm tra `window.emotionApp.isRunning` có chuyển về `false` không
- Kiểm tra hàm `updateExportButtons()` có được gọi không
- Xem Console log

### Vấn đề: Popup không xuất hiện
**Giải pháp**:
- Kiểm tra `endSession()` có được gọi không
- Kiểm tra `showSessionEndNotification()` có lỗi không
- Xem Console log

### Vấn đề: Vẫn xuất được PDF khi camera đang chạy
**Giải pháp**:
- Logic kiểm tra đã có trong `exportProductivityReport()`
- Không nên xảy ra nếu code đúng

## Tổng kết

Luồng xuất báo cáo đã được tối ưu hóa để:
- ✅ Đảm bảo dữ liệu đầy đủ
- ✅ UX thân thiện với popup gợi ý
- ✅ Rõ ràng, dễ hiểu cho người dùng
- ✅ Linh hoạt (xuất ngay hoặc sau)
