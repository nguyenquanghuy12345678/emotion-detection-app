# 📦 Hướng Dẫn Tải Models cho Emotion Detection App

## Vấn Đề Hiện Tại
Bạn chỉ có file manifest nhưng thiếu các file weights thực sử (`.shard` hoặc `.bin`).

## Giải Pháp

### Cách 1: Sử dụng CDN (Đơn giản - Đã cấu hình sẵn) ✅
Ứng dụng hiện đang dùng CDN, không cần tải models về. Chỉ cần:
1. Đảm bảo có kết nối internet
2. Mở `index.html` trong trình duyệt
3. Cho phép quyền truy cập webcam

### Cách 2: Tải Models Local (Offline)

**Bước 1: Tải đầy đủ models**
```bash
# Vào thư mục models
cd d:\CODE_WORD\emotion-detection-app\emotion-detection-app\models

# Tải tiny_face_detector
curl -L -o tiny_face_detector_model-weights_manifest.json https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json
curl -L -o tiny_face_detector_model-shard1 https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-shard1

# Tải face_expression_model
curl -L -o face_expression_model-weights_manifest.json https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_expression_model-weights_manifest.json
curl -L -o face_expression_model-shard1 https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_expression_model-shard1
```

**Bước 2: Cập nhật config.js**
Thay đổi dòng 3 trong `js/config.js`:
```javascript
MODEL_URL: './models/',  // Thay vì CDN
```

**Bước 3: Chạy với HTTP Server**
```bash
# Sử dụng Python
python -m http.server 8080

# Hoặc Node.js (nếu có)
npx http-server -p 8080

# Hoặc PHP
php -S localhost:8080
```

Sau đó mở: http://localhost:8080

## Kiểm Tra Models Đã Tải Đúng

Thư mục `models/` cần có các file sau:
```
models/
├── tiny_face_detector_model-weights_manifest.json
├── tiny_face_detector_model-shard1
├── face_expression_model-weights_manifest.json
└── face_expression_model-shard1
```

## Lỗi Thường Gặp

### 1. "Failed to load models"
- **Nguyên nhân:** Thiếu file weights hoặc đường dẫn sai
- **Giải pháp:** Tải đầy đủ các file hoặc dùng CDN

### 2. "CORS error"
- **Nguyên nhân:** Mở file HTML trực tiếp (file://)
- **Giải pháp:** Dùng HTTP server

### 3. "Camera not accessible"
- **Nguyên nhân:** Không cho phép quyền webcam
- **Giải pháp:** Cho phép quyền trong trình duyệt

### 4. "Models loading timeout"
- **Nguyên nhân:** Kết nối internet chậm (nếu dùng CDN)
- **Giải pháp:** Dùng models local hoặc đợi lâu hơn

## Khuyến Nghị

🎯 **Đối với người dùng có internet:** Dùng CDN (cấu hình hiện tại)
🎯 **Đối với offline/intranet:** Tải models local và chạy HTTP server

## Test Nhanh

Mở Console trong trình duyệt (F12) và chạy:
```javascript
console.log('Models loaded:', faceapi.nets.tinyFaceDetector.isLoaded);
console.log('Expression loaded:', faceapi.nets.faceExpressionNet.isLoaded);
```

Nếu cả 2 đều `true` thì models đã load thành công! ✅
