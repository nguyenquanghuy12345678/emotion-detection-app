# 🎯 CHẠY NGAY - KHÔNG CẦN THÊM FILE GÌ!

## ✅ BẠN ĐÃ CÓ ĐẦY ĐỦ MỌI THỨ!

```
✅ index.html          (Trang chính)
✅ js/app.js           (Logic chính)
✅ js/camera.js        (Xử lý camera)
✅ js/config.js        (Cấu hình)
✅ js/emotions.js      (Xử lý cảm xúc)
✅ css/styles.css      (Giao diện)
✅ OPEN_APP.bat        (Mở nhanh)
✅ START_SERVER.bat    (Chạy server)
✅ diagnostic.html     (Kiểm tra lỗi)
```

## 🚀 3 BƯỚC ĐỂ CHẠY:

### Bước 1: Mở ứng dụng
```powershell
# Cách 1: Double-click file
OPEN_APP.bat

# Cách 2: Dùng PowerShell
.\OPEN_APP.bat
```

### Bước 2: Cho phép camera
Khi trình duyệt hỏi "Allow camera?" → Click **Allow**

### Bước 3: Bắt đầu
Click nút **"Bắt Đầu"** màu xanh

---

## ⚠️ NẾU GẶP LỖI:

### Lỗi: "CORS policy" (trong Console F12)
**Giải pháp:** Dùng server thay vì mở trực tiếp
```powershell
.\START_SERVER.bat
```
Sau đó mở: http://localhost:8080

### Lỗi: "Models failed to load"
**Nguyên nhân:** Không có internet

**Giải pháp 1:** Bật internet (app đang dùng CDN)

**Giải pháp 2:** Tải models về local
```powershell
# Vào thư mục models
cd models

# Tải tiny_face_detector
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json" -OutFile "tiny_face_detector_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-shard1" -OutFile "tiny_face_detector_model-shard1"

# Tải face_expression_model
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_expression_model-weights_manifest.json" -OutFile "face_expression_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_expression_model-shard1" -OutFile "face_expression_model-shard1"

cd ..
```

Sau đó sửa `js/config.js`:
```javascript
MODEL_URL: './models/',  // Thay dòng 3
```

### Lỗi: "Camera not found"
**Kiểm tra:**
1. Có webcam không?
2. Webcam có đang được app khác sử dụng?
3. Đã cho phép quyền camera chưa?

**Giải pháp:**
- Đóng các app đang dùng camera (Zoom, Teams, etc.)
- Vào Settings → Privacy → Camera → Bật quyền

---

## 🧪 KIỂM TRA HỆ THỐNG:

Nếu không chắc vấn đề ở đâu:
```powershell
# Mở file diagnostic
Start-Process diagnostic.html
```

Hoặc mở `diagnostic.html` và nhấn **"Chạy Kiểm Tra Đầy Đủ"**

---

## 📊 CHECKLIST HOÀN CHỈNH:

- [x] File HTML và JS đầy đủ
- [x] File CSS có sẵn
- [x] Batch files để chạy
- [ ] Internet (để load models từ CDN)
- [ ] Webcam hoạt động
- [ ] Quyền camera được cấp
- [ ] Trình duyệt Chrome/Edge/Firefox

---

## 💡 MẸO HAY:

1. **Test nhanh:** Mở `diagnostic.html` để kiểm tra mọi thứ
2. **Offline:** Tải models về như hướng dẫn trên
3. **Tốc độ tốt:** Dùng `START_SERVER.bat` thay vì mở file trực tiếp
4. **Debug:** Mở Console (F12) để xem lỗi chi tiết

---

## 🎉 CÁCH SỬ DỤNG:

1. **Nhấn "Bắt Đầu"**
2. **Nhìn vào camera**
3. **Thay đổi biểu cảm:**
   - 😄 Cười → Happy
   - 😢 Buồn → Sad
   - 😡 Tức → Angry
   - 😲 Mở to mắt → Surprised
   - 😐 Bình thường → Neutral
   - 😨 Sợ → Fearful
   - 🤢 Nhăn mặt → Disgusted

4. **Xem AI nhận diện:**
   - Emoji thay đổi
   - Màu nền đổi
   - Hiển thị message
   - FPS & độ chính xác

---

## 📞 VẪN KHÔNG CHẠY?

**Làm theo thứ tự:**

1. ✅ Chạy `diagnostic.html` → Xem lỗi ở đâu
2. ✅ Mở Console (F12) → Copy lỗi
3. ✅ Đọc `TROUBLESHOOTING.md` → Tìm giải pháp
4. ✅ Kiểm tra internet → Ping google.com

---

**KHÔNG CẦN THÊM FILE GÌ NỮA!**  
**TẤT CẢ ĐÃ ĐẦY ĐỦ!**  
**CHỈ CẦN CHẠY VÀ DÙNG THÔI!** 🚀

---

Made with ❤️ using Face-API.js  
_Last updated: Oct 6, 2025_
