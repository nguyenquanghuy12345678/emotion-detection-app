# 🚀 HƯỚNG DẪN KHẮC PHỤC SỰ CỐ - EMOTION DETECTION APP

## ❓ Vấn Đề Của Bạn

Bạn đang gặp lỗi khi chạy ứng dụng từ thư mục:
```
PS D:\CODE_WORD\emotion-detection-app\emotion-detection-app>
```

## ✅ GIẢI PHÁP NHANH (Chọn 1 trong các cách sau)

### 🎯 Cách 1: Mở Trực Tiếp (Đơn giản nhất)

1. **Double-click vào file `OPEN_APP.bat`**
   - Hoặc chạy: `.\OPEN_APP.bat` trong PowerShell
   - Ứng dụng sẽ mở trong trình duyệt mặc định

2. **Cho phép quyền truy cập camera** khi trình duyệt yêu cầu

3. **Nhấn nút "Bắt Đầu"** để bắt đầu nhận diện cảm xúc

### 🎯 Cách 2: Chạy Với Server (Khuyến nghị)

1. **Double-click vào file `START_SERVER.bat`**
   - Hoặc chạy: `.\START_SERVER.bat` trong PowerShell
   - Script sẽ tự động tìm Node.js/Python/PHP và khởi động server

2. **Truy cập:** http://localhost:8080

3. **Cho phép quyền camera** và bắt đầu sử dụng

### 🎯 Cách 3: Kiểm Tra Hệ Thống Trước

1. **Mở file `diagnostic.html`** trong trình duyệt
   - Double-click vào file
   - Hoặc chạy: `Start-Process diagnostic.html`

2. **Nhấn nút "Chạy Kiểm Tra Đầy Đủ"**

3. **Xem kết quả:**
   - ✅ = OK, tiếp tục dùng ứng dụng
   - ❌ = Có lỗi, xem log chi tiết

## 🔧 Khắc Phục Lỗi Thường Gặp

### Lỗi 1: "Models không load được"

**Nguyên nhân:** Không có kết nối internet hoặc file models thiếu

**Giải pháp:**
```powershell
# Kiểm tra internet
ping google.com

# Nếu không có internet, tải models về:
cd models
# Xem file MODELS_SETUP.md để tải đầy đủ
```

**Hoặc:** Ứng dụng đang dùng CDN, chỉ cần có internet là được!

### Lỗi 2: "Camera không hoạt động"

**Nguyên nhân:** Quyền truy cập camera bị từ chối

**Giải pháp:**
1. Mở Settings trong trình duyệt (Chrome: chrome://settings/content/camera)
2. Cho phép truy cập camera cho localhost/file
3. Reload lại trang

### Lỗi 3: "CORS Error" (trong Console F12)

**Nguyên nhân:** Mở file HTML trực tiếp (file://)

**Giải pháp:**
```powershell
# Dùng server thay vì mở trực tiếp
.\START_SERVER.bat
```

### Lỗi 4: "Không có gì hiển thị"

**Kiểm tra:**
1. Mở Console (F12) xem có lỗi không
2. Kiểm tra đã cho phép camera chưa
3. Thử reload lại trang (Ctrl + F5)

## 📁 Cấu Trúc File Quan Trọng

```
emotion-detection-app/
├── index.html              ← File chính để chạy
├── diagnostic.html         ← Kiểm tra hệ thống
├── OPEN_APP.bat           ← Mở nhanh
├── START_SERVER.bat       ← Chạy server
├── MODELS_SETUP.md        ← Hướng dẫn setup models
├── css/
│   └── styles.css
├── js/
│   ├── app.js             ← Logic chính
│   ├── config.js          ← Cấu hình (models path ở đây!)
│   ├── camera.js          ← Xử lý camera
│   └── emotions.js        ← Xử lý cảm xúc
└── models/                ← Thư mục models (hiện dùng CDN)
    ├── tiny_face_detector_model-weights_manifest.json
    └── face_expression_model-weights_manifest.json
```

## 🎓 Cấu Hình Hiện Tại

### Models Path (trong `js/config.js`):
```javascript
MODEL_URL: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'
```

**Nghĩa là:** 
- ✅ Đang dùng CDN (cần internet)
- ✅ Không cần tải models về
- ✅ Luôn có phiên bản mới nhất

**Nếu muốn dùng offline:**
1. Xem file `MODELS_SETUP.md`
2. Tải đầy đủ models về thư mục `models/`
3. Sửa `config.js`: `MODEL_URL: './models/'`

## 🧪 Test Thử

### Test 1: Mở Console và chạy
```javascript
console.log(typeof faceapi)  // Phải là "object"
```

### Test 2: Kiểm tra models
```javascript
console.log(faceapi.nets.tinyFaceDetector.isLoaded)  // true = đã load
console.log(faceapi.nets.faceExpressionNet.isLoaded) // true = đã load
```

### Test 3: Kiểm tra camera
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(() => console.log("Camera OK!"))
  .catch(e => console.error("Camera error:", e))
```

## 📞 Vẫn Không Chạy Được?

### Checklist:
- [ ] Có kết nối internet?
- [ ] Trình duyệt Chrome/Edge/Firefox (phiên bản mới)?
- [ ] Cho phép quyền camera?
- [ ] Mở Console (F12) có lỗi gì không?
- [ ] Thử chạy `diagnostic.html` chưa?

### Thông Tin Hệ Thống Cần Thiết:
- Trình duyệt: ____________ (version: ____)
- OS: Windows __________
- Webcam: Có ☐ / Không ☐
- Internet: Có ☐ / Không ☐

## 🎉 Nếu Đã Chạy Được

### Cách Sử Dụng:
1. Nhấn "Bắt Đầu"
2. Nhìn vào camera
3. Thay đổi biểu cảm để xem AI nhận diện
4. App sẽ:
   - Hiển thị cảm xúc bằng emoji
   - Đổi màu nền
   - Phát âm thanh (một số cảm xúc)
   - Hiển thị message động

### 7 Cảm Xúc Được Nhận Diện:
- 😄 Vui vẻ (Happy)
- 😢 Buồn (Sad)
- 😡 Tức giận (Angry)
- 😲 Ngạc nhiên (Surprised)
- 😐 Bình thường (Neutral)
- 😨 Sợ hãi (Fearful)
- 🤢 Ghê tởm (Disgusted)

---

**Made with ❤️ using Face-API.js**

_Nếu cần hỗ trợ thêm, hãy mở Console (F12) và gửi screenshot lỗi!_
