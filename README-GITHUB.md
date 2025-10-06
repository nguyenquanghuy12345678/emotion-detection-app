# 🎭 AI Emotion Detection

Ứng dụng nhận diện cảm xúc thời gian thực sử dụng AI và webcam.

## ✨ Tính năng

- 🎥 Nhận diện khuôn mặt real-time
- 😊 Phát hiện 7 cảm xúc: Vui, Buồn, Tức giận, Ngạc nhiên, Bình thường, Sợ hãi, Ghê tởm
- 🎨 Thay đổi màu nền theo cảm xúc
- 💬 Hiển thị tin nhắn động
- ✨ Hiệu ứng đặc biệt
- 📊 Hiển thị FPS và độ chính xác

## 🚀 Demo

🌐 **Live Demo:** [https://yourdomain.com](https://yourdomain.com)

## 🛠️ Công nghệ

- **Face-API.js** - Face detection & emotion recognition
- **TensorFlow.js** - Machine learning backend
- **JavaScript** - Frontend logic
- **HTML5 Canvas** - Video rendering
- **CSS3** - Animations & styling

## 📋 Yêu cầu

- ✅ Trình duyệt hiện đại (Chrome, Edge, Firefox)
- ✅ Webcam
- ✅ HTTPS (cho production)

## 🚀 Chạy Local

### Cách 1: HTTP Server

```bash
# Node.js
npx http-server -p 8080

# Python
python -m http.server 8080

# Hoặc dùng batch file
.\RUN_WITH_LOCAL_MODELS.bat
```

Sau đó mở: http://localhost:8080

### Cách 2: Live Server (VS Code)

1. Install extension "Live Server"
2. Right-click `index.html`
3. "Open with Live Server"

## 🌐 Deploy lên Web

### GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/emotion-detection.git
git push -u origin main
```

Sau đó enable GitHub Pages trong Settings.

### Vercel (1 lệnh)

```bash
npm install -g vercel
vercel --prod
```

### Netlify

Drag & drop thư mục vào https://app.netlify.com/drop

## 📁 Cấu trúc

```
emotion-detection-app/
├── index.html              # Trang chính
├── diagnostic.html         # Kiểm tra hệ thống
├── js/
│   ├── app.js             # Logic chính
│   ├── camera.js          # Xử lý camera (✅ Optimized for web)
│   ├── config.js          # Cấu hình (✅ Auto environment detection)
│   └── emotions.js        # Xử lý cảm xúc
├── css/
│   └── styles.css         # Giao diện
└── models/                # Models local (optional)
```

## ⚙️ Cấu hình

### Auto Environment Detection

```javascript
// Localhost → Local models
// Production → CDN models
MODEL_URL: auto-detect
```

### Camera Settings

```javascript
VIDEO_WIDTH: 1280          // 720p quality
VIDEO_HEIGHT: 720
VIDEO_FACING_MODE: 'user'  // Front camera
```

### Production Settings

```javascript
ENABLE_HTTPS_CHECK: true   // Require HTTPS
ENABLE_DEBUG_LOG: false    // Disable console logs
```

## 🔒 Bảo mật

- ✅ HTTPS required for camera access
- ✅ No data sent to external servers
- ✅ All processing done locally
- ✅ Privacy-first design

## 📱 Tương thích

- ✅ Desktop (Windows, Mac, Linux)
- ✅ Mobile (iOS, Android)
- ✅ Tablet
- ✅ Chrome, Edge, Firefox, Safari

## 🐛 Troubleshooting

### Camera không hoạt động

1. Đảm bảo đang dùng HTTPS (production)
2. Cho phép quyền camera
3. Kiểm tra camera không bị app khác sử dụng

### Models không load

1. Kiểm tra kết nối internet (nếu dùng CDN)
2. Hard reload (Ctrl + F5)
3. Xem console (F12) để debug

Chi tiết: Xem file `TROUBLESHOOTING.md`

## 📚 Documentation

- [DEPLOY_WEB.md](DEPLOY_WEB.md) - Hướng dẫn deploy chi tiết
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Khắc phục sự cố
- [BUGFIX_TENSORFLOW.md](BUGFIX_TENSORFLOW.md) - Chi tiết bug fixes
- [MODELS_LOCAL_READY.md](MODELS_LOCAL_READY.md) - Setup models local

## 🎯 Features

- [x] Real-time face detection
- [x] 7 emotion recognition
- [x] Dynamic background colors
- [x] Animated emojis
- [x] Sound effects
- [x] FPS counter
- [x] Confidence display
- [x] HTTPS support
- [x] Mobile responsive
- [x] Auto environment detection
- [ ] Multi-face detection
- [ ] Recording feature
- [ ] Screenshot feature

## 🤝 Contributing

Contributions welcome! Feel free to:

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Face-API.js](https://github.com/justadudewhohacks/face-api.js)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [vladmandic/face-api](https://github.com/vladmandic/face-api) for models

## 📞 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

Made with ❤️ using Face-API.js & TensorFlow.js

**🌟 If you like this project, give it a star!**
