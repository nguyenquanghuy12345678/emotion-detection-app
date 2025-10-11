# 🤖 AI TRỢ LÝ CÔNG VIỆC - EMOTION DETECTION

> Ứng dụng AI thông minh kết hợp nhận diện cảm xúc với hỗ trợ năng suất làm việc

## ✨ TÍNH NĂNG CHÍNH

### 1. 🎭 Nhận Diện Cảm Xúc Thời Gian Thực
- ✅ Phát hiện 7 cảm xúc: Vui, Buồn, Giận dữ, Ngạc nhiên, Trung tính, Sợ hãi, Ghê tởm
- ✅ Độ chính xác cao với Face-API.js
- ✅ Hiển thị realtime qua webcam
- ✅ Thống kê độ tin cậy

### 2. 💼 Hỗ Trợ Công Việc Tự Động
- ✅ **Theo dõi trạng thái làm việc** - Phân tích tập trung, mệt mỏi, căng thẳng
- ✅ **Pomodoro Timer** - Quản lý thời gian làm việc hiệu quả
- ✅ **Ghi chú công việc** - Lưu trạng thái cảm xúc kèm ghi chú
- ✅ **Thống kê năng suất** - Báo cáo chi tiết về hiệu suất

### 3. 🤖 AI ASSISTANT - TRỢ LÝ ẢO THÔNG MINH

#### 🚨 Giám Sát & Cảnh Báo Tự Động
- **Phát hiện căng thẳng kéo dài** - Cảnh báo khi phát hiện cảm xúc tiêu cực liên tục
- **Phát hiện mệt mỏi** - Đề xuất nghỉ ngơi khi phát hiện dấu hiệu mệt mỏi
- **Cảnh báo mất tập trung** - Nhắc nhở khi điểm tập trung giảm xuống dưới ngưỡng
- **Phát hiện vắng mặt** - Ghi nhận khi không có mặt trước camera (chống gian lận)

#### 💬 Chatbot AI Tương Tác
- Trò chuyện thông minh bằng văn bản hoặc giọng nói
- Trả lời câu hỏi về năng suất, cảm xúc
- Điều khiển tính năng bằng lệnh tự nhiên
- Đề xuất cá nhân hóa dựa trên dữ liệu

#### 🎯 Đề Xuất Thông Minh
- Gợi ý nghỉ ngơi theo thời gian
- Đề xuất kỹ thuật tập trung
- Nhắc nhở ăn uống, vận động
- Phân tích xu hướng và cải thiện

#### 🔊 Voice Assistant
- Nhận diện giọng nói (tiếng Việt)
- Đọc cảnh báo bằng giọng nói
- Điều khiển hands-free

### 4. 📊 Phân Tích & Thống Kê
- 📈 Biểu đồ phân bố cảm xúc
- ⏱️ Theo dõi thời gian làm việc
- 🎯 Tính điểm tập trung
- 📜 Lịch sử cảm xúc theo timeline
- 💾 Xuất báo cáo JSON

## 🎯 KỊCH BẢN SỬ DỤNG THỰC TẾ

### 📚 Học sinh / Sinh viên
```
✅ Theo dõi thời gian học tập hiệu quả
✅ Phát hiện mất tập trung, đề xuất nghỉ ngơi
✅ Chống gian lận trong thi online (phát hiện vắng mặt)
✅ Báo cáo năng suất học tập cho phụ huynh
✅ Quản lý thời gian ôn tập với Pomodoro
```

**Ví dụ:** 
- Học sinh đang ôn thi → AI phát hiện căng thẳng liên tục → Cảnh báo + gợi ý nghỉ 10 phút
- Đang thi online → Rời khỏi màn hình → Ghi nhận vắng mặt + cảnh báo

### 💼 Nhân viên Remote / Work From Home
```
✅ Tính giờ làm việc chính xác
✅ Báo cáo năng suất cho quản lý
✅ Phát hiện làm việc quá giờ, nhắc nghỉ
✅ Theo dõi hiệu suất theo ngày/tuần/tháng
✅ Xuất báo cáo cho HR
```

**Ví dụ:**
- Làm việc 3 giờ liên tục → AI gợi ý nghỉ ngơi
- Làm việc đến 11h đêm → Cảnh báo sức khỏe
- Cuối ngày → Xuất báo cáo: Đã làm 8h, tập trung 85%

### 🧑‍💼 Freelancer
```
✅ Theo dõi thời gian cho từng dự án
✅ Tính toán giờ làm để báo giá
✅ Tối ưu năng suất cá nhân
✅ Quản lý nhiều task cùng lúc
✅ Xuất báo cáo cho khách hàng
```

**Ví dụ:**
- Làm dự án A → Ghi chú "Thiết kế UI" → Theo dõi 2.5h
- Xuất báo cáo: Dự án A - 15h (tập trung 90%), Dự án B - 10h (tập trung 75%)

### 🎮 Game thủ / Streamer
```
✅ Theo dõi cảm xúc khi chơi game
✅ Phát hiện rage/tilting → Gợi ý nghỉ
✅ Thống kê trạng thái tinh thần
✅ Tối ưu performance
```

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Khởi động ứng dụng
```bash
# Mở file index.html hoặc chạy server
START_SERVER.bat
```

### Bước 2: Cho phép truy cập Camera
- Trình duyệt sẽ yêu cầu quyền camera
- Nhấn "Allow" để cho phép

### Bước 3: Bật chế độ tự động
1. Vào tab **🤖 AI Trợ Lý**
2. Bật **Chế độ tự động**
3. Tùy chỉnh ngưỡng cảnh báo nếu muốn

### Bước 4: Bắt đầu làm việc
1. Nhấn **▶️ Bắt Đầu** ở tab Nhận Diện Cảm Xúc
2. AI sẽ tự động:
   - Phát hiện cảm xúc
   - Phân tích trạng thái
   - Cảnh báo khi cần
   - Đề xuất nghỉ ngơi

### Bước 5: Tương tác với AI Assistant
**Bằng Chat:**
```
Bạn: "Báo cáo năng suất"
AI: 📊 BÁO CÁO NĂNG SUẤT
    🎯 Điểm tập trung: 87/100
    ⏱️ Tổng thời gian: 2h 30m
    🍅 Pomodoro hoàn thành: 5
    ...
```

**Bằng Giọng Nói:**
```
Bạn: 🎤 "Bắt đầu Pomodoro"
AI: 🔊 "Đã bắt đầu Pomodoro! Tập trung làm việc trong 25 phút nhé!"
```

**Các lệnh hữu ích:**
- "Báo cáo năng suất"
- "Cảm xúc hiện tại"
- "Bắt đầu Pomodoro"
- "Nghỉ ngơi"
- "Gợi ý tập trung"
- "Xuất báo cáo"

## ⚙️ CÀI ĐẶT

### Ngưỡng Cảnh Báo (Tùy chỉnh theo nhu cầu)

| Tham số | Mặc định | Ý nghĩa |
|---------|----------|---------|
| Căng thẳng liên tục | 3 lần | Phát hiện angry/disgusted 3 lần liên tiếp |
| Mệt mỏi liên tục | 5 lần | Phát hiện sad/fearful 5 lần liên tiếp |
| Điểm tập trung tối thiểu | 40 | Cảnh báo khi điểm < 40 |
| Không phát hiện khuôn mặt | 10 lần | Cảnh báo vắng mặt sau 10 lần |

### Chế độ Tự Động

- **🔔 Cảnh báo**: Bật/tắt thông báo
- **💡 Gợi ý**: Bật/tắt gợi ý thông minh
- **🔊 Giọng nói**: Đọc cảnh báo bằng giọng
- **📊 Báo cáo**: Tự động gửi báo cáo

## 📊 DỮ LIỆU & BÁO CÁO

### Dữ liệu được lưu trữ (LocalStorage)
```json
{
  "stats": {
    "totalWorkTime": 14400,
    "focusedTime": 12000,
    "pomodoroCount": 8
  },
  "emotionHistory": [...],
  "workNotes": [...],
  "absenceLog": [...]
}
```

### Xuất Báo Cáo
**Format JSON** - Chi tiết đầy đủ
```javascript
{
  "exportDate": "2025-10-11T10:30:00.000Z",
  "stats": {...},
  "emotionHistory": [...],
  "workNotes": [...],
  "focusScore": 87,
  "pomodoroCount": 8
}
```

## 🔧 YÊU CẦU KỸ THUẬT

- **Trình duyệt**: Chrome, Edge, Firefox (mới nhất)
- **Camera**: Webcam hoạt động
- **Internet**: Tải models (lần đầu)
- **Microphone**: (Tùy chọn) Cho voice assistant

## 💡 TIPS & TRICKS

### Tối ưu hiệu suất
1. Đóng các tab không cần thiết
2. Đảm bảo ánh sáng tốt cho camera
3. Ngồi thẳng mặt vào camera

### Sử dụng hiệu quả
1. **Bật chế độ tự động** ngay từ đầu
2. **Đặt mục tiêu** với Pomodoro Timer
3. **Ghi chú công việc** để theo dõi task
4. **Xuất báo cáo** cuối ngày để review

### Tránh False Alert
1. Điều chỉnh ngưỡng cảnh báo phù hợp
2. Không rời khỏi camera quá lâu
3. Giữ khuôn mặt trong khung hình

## 🔒 QUYỀN RIÊNG TƯ

- ✅ **100% Local** - Không gửi dữ liệu lên server
- ✅ **Không lưu ảnh** - Chỉ phân tích realtime
- ✅ **Dữ liệu riêng tư** - Lưu trên máy bạn (LocalStorage)
- ✅ **Kiểm soát hoàn toàn** - Xóa dữ liệu bất cứ lúc nào

## 🆘 TROUBLESHOOTING

### Camera không hoạt động
```
✅ Kiểm tra quyền camera trong browser
✅ Đảm bảo không app nào đang dùng camera
✅ Thử trình duyệt khác
```

### AI không phát hiện khuôn mặt
```
✅ Cải thiện ánh sáng
✅ Ngồi gần camera hơn
✅ Giữ mặt thẳng vào camera
```

### Cảnh báo quá nhiều
```
✅ Tăng ngưỡng cảnh báo
✅ Tắt một số loại cảnh báo
✅ Điều chỉnh thời gian kiểm tra
```

## 📱 LIÊN HỆ & HỖ TRỢ

- **Issues**: [GitHub Issues](https://github.com/nguyenquanghuy12345678/emotion-detection-app/issues)
- **Email**: support@example.com

## 📜 LICENSE

MIT License - Sử dụng tự do cho mục đích cá nhân và thương mại.

---

**Made with ❤️ by AI Assistant**

*Phát triển để giúp mọi người làm việc hiệu quả và khỏe mạnh hơn!*
