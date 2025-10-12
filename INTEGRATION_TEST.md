# 🔬 Hướng Dẫn Kiểm Tra Tích Hợp

## ✅ Checklist Kiểm Tra AI Assistant

### 1️⃣ **Khởi Động & Khởi Tạo** (30 giây)

- [ ] Mở `index.html` trong trình duyệt
- [ ] Bật camera (nhấn "Bắt đầu Camera")
- [ ] Kiểm tra Console (F12) xem có message: `✅ AI Assistant initialized and ready!`
- [ ] Chat panel hiển thị welcome message:
  - "👋 Xin chào! Tôi là AI Assistant"
  - "✅ Chế độ tự động đã BẬT"

✅ **Pass nếu**: Thấy console log và welcome message trong 5 giây

---

### 2️⃣ **Tích Hợp Emotion Detection** (1-2 phút)

**Test khi có khuôn mặt:**
- [ ] Ngồi trước camera với cảm xúc vui (mỉm cười)
- [ ] Kiểm tra tab "Hỗ Trợ Năng Suất" → thống kê cập nhật
- [ ] Thời gian session tăng theo giây

**Test khi KHÔNG có khuôn mặt:**
- [ ] Rời khỏi camera 10 giây
- [ ] Sau 10 giây, kiểm tra:
  - [ ] Alert xuất hiện: "👤 Phát Hiện Vắng Mặt"
  - [ ] Console log: `🔔 Alert [absence/high]`

✅ **Pass nếu**: 
- Stats cập nhật real-time (mỗi giây)
- Alert xuất hiện sau 10 giây không có mặt

---

### 3️⃣ **Cảnh Báo Căng Thẳng** (30-60 giây)

**Mô phỏng căng thẳng:**
- [ ] Tạo biểu cảm giận dữ/căng thẳng liên tục 15-20 giây
- [ ] Kiểm tra alert xuất hiện:
  - Tiêu đề: "🚨 Cảnh Báo Căng Thẳng"
  - Nội dung: "Bạn đang căng thẳng (X/5 lần gần đây)"
  - Gợi ý: "Thở sâu 5 lần..."

✅ **Pass nếu**: Alert xuất hiện trong 30 giây với nội dung đúng

---

### 4️⃣ **Cảnh Báo Mệt Mỏi** (30-60 giây)

**Mô phỏng mệt mỏi:**
- [ ] Tạo biểu cảm buồn/mệt mỏi liên tục 20 giây
- [ ] Kiểm tra alert:
  - Tiêu đề: "😴 Cảnh Báo Mệt Mỏi"
  - Gợi ý nghỉ ngơi 15-20 phút

✅ **Pass nếu**: Alert xuất hiện với gợi ý nghỉ ngơi

---

### 5️⃣ **Chatbot AI Assistant** (1 phút)

**Test các lệnh:**
- [ ] Mở chat (nút chat nổi)
- [ ] Gửi: "Báo cáo năng suất"
  - → Bot trả lời với số liệu thống kê
- [ ] Gửi: "Bắt đầu Pomodoro"
  - → Bot xác nhận bắt đầu, timer chạy
- [ ] Gửi: "Cảm xúc hiện tại"
  - → Bot mô tả cảm xúc đang phát hiện

✅ **Pass nếu**: Bot hiểu và phản hồi đúng tất cả lệnh

---

### 6️⃣ **Hiệu Suất Real-Time** (2-3 phút)

**Kiểm tra độ trễ:**
- [ ] Thay đổi cảm xúc (vui → buồn → vui)
- [ ] Đo thời gian từ thay đổi → cập nhật UI
  - **Mục tiêu**: < 3 giây

**Kiểm tra không bị lag:**
- [ ] Sử dụng liên tục 2-3 phút
- [ ] Camera không giật lag
- [ ] UI cập nhật mượt mà

✅ **Pass nếu**: 
- Response time < 5 giây
- Không có lag đáng kể

---

### 7️⃣ **Gợi Ý Theo Thời Gian** (Tùy thời điểm)

**Nếu test lúc 12h trưa:**
- [ ] Sau 1-2 phút, kiểm tra alert:
  - "🍽️ Giờ Ăn Trưa"

**Nếu test lúc 10h tối:**
- [ ] Alert xuất hiện:
  - "🌙 Làm Việc Muộn"

✅ **Pass nếu**: Gợi ý xuất hiện đúng thời gian (chỉ 1 lần)

---

## 🐛 Troubleshooting

### Không thấy alert?
1. Kiểm tra F12 Console có lỗi?
2. Kiểm tra `#alertContainer` có tồn tại trong HTML?
3. Kiểm tra `window.aiAssistant.autoMode.enabled === true`

### Stats không cập nhật?
1. Kiểm tra camera đã bật?
2. Kiểm tra `window.productivityTracker` tồn tại?
3. Reload trang và thử lại

### Chatbot không phản hồi?
1. Mở Console xem message nhận được chưa
2. Kiểm tra `processMessage()` có lỗi?
3. Thử các lệnh đơn giản: "xin chào", "báo cáo"

---

## 📊 Kết Quả Mong Đợi

| Tính năng | Thời gian phản hồi | Trạng thái |
|-----------|-------------------|------------|
| Emotion Detection | < 1s | ✅ |
| Stats Update | 1-3s | ✅ |
| AI Alert (Stress/Tired) | 15-30s | ✅ |
| AI Alert (Absence) | 10-12s | ✅ |
| Chatbot Response | < 1s | ✅ |
| Tích hợp đầy đủ | Real-time | ✅ |

---

## 🎯 Acceptance Criteria

✅ **PASS** nếu:
1. ✅ Tất cả alerts hoạt động
2. ✅ Stats cập nhật real-time (< 3s)
3. ✅ Chatbot hiểu lệnh cơ bản
4. ✅ Không có lag đáng kể
5. ✅ Tích hợp 3 module: Emotion → Productivity → AI

❌ **FAIL** nếu:
- Alerts không xuất hiện
- Response time > 10 giây
- UI bị lag nghiêm trọng
- Chatbot không hiểu lệnh cơ bản

---

## 🚀 Lệnh Test Nhanh

```javascript
// Trong Console (F12):

// 1. Kiểm tra AI Assistant đã khởi tạo?
console.log(window.aiAssistant ? '✅ AI Ready' : '❌ AI Not Found');

// 2. Kiểm tra auto mode?
console.log('Auto Mode:', window.aiAssistant.autoMode.enabled);

// 3. Test alert thủ công
window.aiAssistant.sendAlert('test', '🧪 Test Alert', 'This is a test', 'high');

// 4. Test chatbot
window.aiAssistant.processMessage('Báo cáo năng suất');

// 5. Kiểm tra buffer
console.log('Emotion Buffer:', window.aiAssistant.emotionBuffer.length);
```

---

## 📝 Ghi Chú

- **Buffer Size**: 5 emotions (phân tích sau mỗi 5 khung hình)
- **Process Interval**: 3 giây (để tránh spam alerts)
- **UI Update Throttle**: 1 giây (cân bằng performance)
- **Alert Auto-remove**: 30 giây
- **Max Alerts**: 3 (để tránh clutter)

---

**Tác giả**: AI Assistant Integration Team  
**Phiên bản**: 2.0  
**Ngày cập nhật**: Hôm nay
