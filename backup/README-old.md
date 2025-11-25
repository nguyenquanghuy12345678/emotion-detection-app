# 🎭 AI EMOTION DETECTION WEB APP

Ứng dụng web nhận diện cảm xúc qua webcam sử dụng Face-API.js và AI.

## ✨ Tính Năng

- 🎥 Nhận diện khuôn mặt real-time qua webcam
- 😊 Phát hiện 7 cảm xúc: Vui, Buồn, Tức giận, Ngạc nhiên, Bình thường, Sợ hãi, Ghê tởm
- 🎨 Thay đổi màu nền theo cảm xúc
- 🎵 Phát nhạc/âm thanh phù hợp với cảm xúc
- 💬 Hiển thị tin nhắn động
- ✨ Hiệu ứng đặc biệt (emoji bay, nhấp nháy, rung)
- 📊 Hiển thị FPS và độ chính xác

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu
- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari)
- Webcam
- Kết nối internet (để tải thư viện Face-API.js)

### Cài Đặt

1. **Tải về dự án:**
   ```bash
   git clone https://github.com/yourusername/emotion-detection-app.git
   cd emotion-detection-app
   ```

2. **Cấu trúc thư mục:**
   ```
   emotion-detection-app/
   ├── index.html
   ├── css/
   │   └── styles.css
   ├── js/
   │   ├── config.js
   │   ├── emotions.js
   │   ├── camera.js
   │   └── app.js
   └── README.md
   ```

3. **Chạy ứng dụng:**
   
   **Cách 1: Sử dụng Live Server (VS Code)**
   - Cài đặt extension "Live Server"
   - Click chuột phải vào `index.html`
   - Chọn "Open with Live Server"

   **Cách 2: Sử dụng Python HTTP Server**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   Sau đó mở trình duyệt: `http://localhost:8000`

   **Cách 3: Sử dụng Node.js http-server**
   ```bash
   npx http-server
   ```

4. **Cấp quyền truy cập camera:**
   - Trình duyệt sẽ yêu cầu quyền truy cập camera
   - Chọn "Allow" để tiếp tục

## 📱 Hướng Dẫn Sử Dụng

1. Mở ứng dụng trong trình duyệt
2. Đợi mô hình AI tải xong (khoảng 5-10 giây)
3. Nhấn nút **"▶️ Bắt Đầu"**
4. Cho phép truy cập camera khi được yêu cầu
5. Đặt khuôn mặt vào khung hình
6. Quan sát cảm xúc được nhận diện và các hiệu ứng tương ứng
7. Nhấn **"⏹️ Dừng Lại"** để kết thúc

## 🎨 Phản Ứng Theo Cảm Xúc

| Cảm Xúc | Emoji | Màu Nền | Hiệu Ứng |
|---------|-------|---------|----------|
| 😄 Vui | 😄 | Vàng sáng | Nhạc vui, nền sáng |
| 😢 Buồn | 😢 | Xám tối | Câu an ủi, nền tối |
| 😡 Tức giận | 😡 | Đỏ | Nhạc dịu, rung động |
| 😲 Ngạc nhiên | 😲 | Nhiều màu | Emoji bay, nhấp nháy |
| 😐 Bình thường | 😐 | Xanh dương | Thông báo nhẹ nhàng |
| 😨 Sợ hãi | 😨 | Tím | Câu động viên |
| 🤢 Ghê tởm | 🤢 | Xanh lá | Tin nhắn hỗ trợ |

## 🛠️ Công Nghệ Sử Dụng

- **HTML5** - Cấu trúc trang web
- **CSS3** - Styling và animations
- **JavaScript (ES6+)** - Logic chính
- **Face-API.js** - Thư viện nhận diện khuôn mặt và cảm xúc
- **Web Audio API** - Tạo âm thanh
- **MediaDevices API** - Truy cập webcam

## 📂 Chi Tiết Files

### `index.html`
- Cấu trúc HTML chính
- Container cho video/canvas
- Các nút điều khiển
- Hiển thị thông tin cảm xúc

### `css/styles.css`
- Styling toàn bộ ứng dụng
- Animations và transitions
- Responsive design
- Theme theo cảm xúc

### `js/config.js`
- Cấu hình hệ thống
- Constants và settings
- Mapping cảm xúc

### `js/emotions.js`
- Class EmotionHandler
- Xử lý hiển thị cảm xúc
- Trigger các phản ứng
- Quản lý audio và hiệu ứng

### `js/camera.js`
- Class CameraHandler
- Khởi tạo và quản lý webcam
- Setup canvas
- Xử lý video stream

### `js/app.js`
- Class EmotionDetectionApp
- Logic chính của ứng dụng
- Tải và khởi tạo models
- Detection loop
- FPS counter

## ⚙️ Tùy Chỉnh

### Thay đổi cấu hình trong `config.js`:

```javascript
const CONFIG = {
    DETECTION_INTERVAL: 100,  // Tần suất detect (ms)
    MIN_CONFIDENCE: 0.5,       // Ngưỡng tin cậy tối thiểu
    VIDEO_WIDTH: 640,          // Độ rộng video
    VIDEO_HEIGHT: 480,         // Độ cao video
    EMOJI_SPAWN_RATE: 2000     // Tốc độ spawn emoji
};
```

### Thêm cảm xúc mới:

```javascript
const EMOTIONS = {
    your_emotion: {
        emoji: '😊',
        label: 'Tên Cảm Xúc',
        message: 'Tin nhắn hiển thị',
        bgClass: 'css-class',
        color: '#hexcolor'
    }
};
```

## 🐛 Xử Lý Lỗi Thường Gặp

### Camera không hoạt động
- Kiểm tra quyền truy cập camera trong browser
- Đảm bảo không có ứng dụng khác đang sử dụng camera
- Thử trình duyệt khác

### Models tải chậm
- Kiểm tra kết nối internet
- Đợi đủ thời gian để models tải hoàn tất
- Xóa cache browser và tải lại

### FPS thấp
- Giảm `VIDEO_WIDTH` và `VIDEO_HEIGHT`
- Tăng `DETECTION_INTERVAL`
- Đóng các tab/ứng dụng khác

### CORS errors
- Chạy qua HTTP server, không mở file trực tiếp
- Sử dụng Live Server hoặc http-server

## 🔒 Bảo Mật & Quyền Riêng Tư

- ✅ Toàn bộ xử lý diễn ra trên client-side
- ✅ Không upload hình ảnh/video lên server
- ✅ Không lưu trữ dữ liệu cá nhân
- ✅ Camera chỉ hoạt động khi người dùng cho phép

## 📝 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

## 👨‍💻 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới
3. Commit changes
4. Push và tạo Pull Request

## 📞 Liên Hệ

Nếu có vấn đề hoặc câu hỏi, hãy tạo issue trên GitHub.

## 🙏 Credits

- [Face-API.js](https://github.com/justadudewhohacks/face-api.js/) - Thư viện nhận diện khuôn mặt
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine Learning framework

---

**Made with ❤️ using AI and JavaScript**
```

---

## 🎯 HƯỚNG DẪN TRIỂN KHAI NHANH

### Bước 1: Tạo thư mục dự án
```bash
mkdir emotion-detection-app
cd emotion-detection-app
```

### Bước 2: Tạo cấu trúc thư mục
```bash
mkdir css js
```

### Bước 3: Tạo các file
- Copy nội dung từ `index.html` vào file `index.html`
- Copy nội dung từ `css/styles.css` vào file `css/styles.css`
- Copy nội dung từ `js/config.js` vào file `js/config.js`
- Copy nội dung từ `js/emotions.js` vào file `js/emotions.js`
- Copy nội dung từ `js/camera.js` vào file `js/camera.js`
- Copy nội dung từ `js/app.js` vào file `js/app.js`
- Copy nội dung từ `README.md` vào file `README.md`

### Bước 4: Chạy ứng dụng
```bash
# Sử dụng Python
python -m http.server 8000

# HOẶC sử dụng Node.js
npx http-server
```

### Bước 5: Mở trình duyệt
Truy cập: `http://localhost:8000`

---

## 🎉 TÍNH NĂNG NỔI BẬT

✅ **Real-time Detection** - Nhận diện cảm xúc ngay lập tức  
✅ **7 Emotions** - Phát hiện đầy đủ các cảm xúc cơ bản  
✅ **Interactive UI** - Giao diện đẹp, phản ứng nhanh  
✅ **Visual Effects** - Hiệu ứng đẹp mắt theo cảm xúc  
✅ **Audio Feedback** - Âm thanh phản hồi  
✅ **FPS Counter** - Theo dõi hiệu năng  
✅ **Responsive** - Hoạt động tốt trên mọi thiết bị  
✅ **No Backend** - 100% client-side, bảo mật  

---

**Chúc bạn thành công! 🚀**