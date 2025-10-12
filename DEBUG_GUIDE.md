# 🐛 HƯỚNG DẪN DEBUG - KHÔNG CHẠY ĐƯỢC

## ⚠️ Triệu Chứng

```
✅ Giao diện HTML hiển thị
❌ Các chức năng KHÔNG phản hồi
❌ Pomodoro không hoạt động
❌ Work notes không hoạt động
❌ Chatbot không phản hồi
❌ Tabs có thể chuyển nhưng trống rỗng
```

---

## 🔍 BƯỚC 1: TEST ĐƠN GIẢN

### Mở file test đơn giản:
```
test-simple.html
```

### Làm theo:
1. Mở `test-simple.html` trong trình duyệt
2. Xem **Step 1** - Phải thấy:
   - ✅ ProductivityTracker class loaded!
   - ✅ AIAssistant class loaded!
3. Nhấn nút **"Test Initialization"** trong Step 2
4. Xem output box

### ✅ Nếu thành công:
```
✅ ProductivityTracker created!
✅ AIAssistant created!
```
→ **Classes OK, vấn đề ở index.html**

### ❌ Nếu lỗi:
```
❌ Error: ...
```
→ **Classes có vấn đề, xem lỗi cụ thể**

---

## 🔍 BƯỚC 2: KIỂM TRA CONSOLE (F12)

### Mở `index.html` + F12 Console

### Tìm các lỗi đỏ (errors):

#### ❌ Lỗi 1: "Uncaught ReferenceError: ProductivityTracker is not defined"
**Nguyên nhân:** File `js/productivity.js` không load được

**Giải pháp:**
1. Kiểm tra file tồn tại:
   ```
   d:\CODE_WORD\emotion-detection-app\js\productivity.js
   ```
2. Mở file kiểm tra dòng đầu có:
   ```javascript
   class ProductivityTracker {
   ```
3. Reload trang: `Ctrl + Shift + R`

#### ❌ Lỗi 2: "Uncaught SyntaxError: Unexpected token"
**Nguyên nhân:** Lỗi cú pháp trong file JS

**Giải pháp:**
1. Xem dòng lỗi trong console
2. Mở file đó kiểm tra syntax
3. Tìm: dấu ngoặc thiếu `}`, dấu phẩy thừa `,`, quotes không đóng `"`

#### ❌ Lỗi 3: "Failed to load resource: net::ERR_FILE_NOT_FOUND"
**Nguyên nhân:** Đường dẫn file sai

**Giải pháp:**
1. Kiểm tra structure:
   ```
   emotion-detection-app/
   ├── index.html
   ├── js/
   │   ├── productivity.js
   │   ├── ai-assistant.js
   │   └── app.js
   ```
2. Đảm bảo tất cả files trong thư mục `js/`

#### ❌ Lỗi 4: "Cannot read property 'addWorkNote' of undefined"
**Nguyên nhân:** `productivityTracker` chưa được khởi tạo

**Giải pháp:**
```javascript
// Trong Console (F12):
console.log(window.productivityTracker);
// Nếu undefined → Chưa khởi tạo
```

---

## 🔍 BƯỚC 3: TEST TRONG CONSOLE

### Mở Console (F12) trên `index.html`

### Test 1: Kiểm tra classes
```javascript
console.log(typeof ProductivityTracker);
// Phải thấy: "function"

console.log(typeof AIAssistant);
// Phải thấy: "function"
```

### Test 2: Thử khởi tạo thủ công
```javascript
// Tạo ProductivityTracker
const pt = new ProductivityTracker();
console.log(pt);
// Phải thấy object với properties

// Tạo AIAssistant
const ai = new AIAssistant(pt);
console.log(ai);
// Phải thấy object với properties
```

### Test 3: Test functions
```javascript
// Test add note
pt.addWorkNote('Test từ console');
console.log(pt.workNotes);
// Phải thấy array có 1 phần tử

// Test Pomodoro
pt.startPomodoro();
console.log(pt.isPomodoroRunning);
// Phải thấy: true

// Test chat
ai.processMessage('xin chào');
// Xem Console có log gì không
```

---

## 🔍 BƯỚC 4: KIỂM TRA HTML

### Mở `index.html`, tìm phần scripts:

```html
<!-- Phải có các dòng này: -->
<script src="js/productivity.js"></script>
<script src="js/ai-assistant.js"></script>
<script src="js/app.js"></script>
```

### Kiểm tra script khởi tạo:

```javascript
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        productivityTracker = new ProductivityTracker();
        window.productivityTracker = productivityTracker;
        
        aiAssistant = new AIAssistant(productivityTracker);
        window.aiAssistant = aiAssistant;
        
        updateProductivityUI();
        updateAnalytics();
    }, 1000);
});
```

**Phải có đoạn code trên!**

---

## 🔍 BƯỚC 5: KIỂM TRA PATHS

### Windows paths - Dấu `/` vs `\`

Trong HTML phải dùng `/`:
```html
✅ ĐÚNG: <script src="js/productivity.js"></script>
❌ SAI:  <script src="js\productivity.js"></script>
```

### Đường dẫn tương đối

```html
✅ ĐÚNG: src="js/productivity.js"    (từ thư mục hiện tại)
❌ SAI:  src="/js/productivity.js"   (từ root)
❌ SAI:  src="../js/productivity.js" (lên 1 cấp)
```

---

## 🛠️ GIẢI PHÁP TỪNG BƯỚC

### Giải pháp 1: Reset hoàn toàn

1. **Backup dữ liệu:**
   ```javascript
   // Trong Console:
   localStorage.clear();
   ```

2. **Hard reload:**
   ```
   Ctrl + Shift + R
   hoặc
   Ctrl + F5
   ```

3. **Clear cache:**
   - F12 → Network tab
   - Check "Disable cache"
   - Reload

### Giải pháp 2: Sử dụng test-simple.html

1. Mở `test-simple.html`
2. Nhấn "Test Initialization"
3. Nếu OK → Copy code sang index.html
4. Nếu lỗi → Xem error message

### Giải pháp 3: Khởi tạo thủ công

Thêm vào cuối `index.html` trước `</body>`:

```html
<script>
// Force initialization
console.log('🔧 Manual initialization...');

setTimeout(() => {
    if (typeof ProductivityTracker !== 'undefined') {
        window.productivityTracker = new ProductivityTracker();
        console.log('✅ ProductivityTracker OK');
    } else {
        console.error('❌ ProductivityTracker not found');
    }
    
    if (typeof AIAssistant !== 'undefined' && window.productivityTracker) {
        window.aiAssistant = new AIAssistant(window.productivityTracker);
        console.log('✅ AIAssistant OK');
    } else {
        console.error('❌ AIAssistant not found');
    }
}, 2000);
</script>
```

### Giải pháp 4: Kiểm tra file encoding

Files phải là **UTF-8**:
1. Mở file trong VS Code
2. Góc dưới bên phải xem encoding
3. Nếu không phải UTF-8 → Click → "Save with Encoding" → UTF-8

---

## 📋 CHECKLIST DEBUG

Làm theo thứ tự:

- [ ] **1. Mở test-simple.html**
  - [ ] Thấy "✅ ProductivityTracker class loaded!"
  - [ ] Thấy "✅ AIAssistant class loaded!"
  - [ ] Nhấn "Test Initialization" → Success
  
- [ ] **2. Mở index.html + F12**
  - [ ] Không có lỗi đỏ trong Console
  - [ ] Thấy logs: "✅ ProductivityTracker initialized"
  - [ ] Thấy logs: "✅ AIAssistant initialized"
  
- [ ] **3. Test trong Console**
  ```javascript
  console.log(window.productivityTracker);  // Phải là object
  console.log(window.aiAssistant);          // Phải là object
  ```
  
- [ ] **4. Test functions trong Console**
  ```javascript
  window.productivityTracker.addWorkNote('Test');
  console.log(window.productivityTracker.workNotes);  // Phải có 1 item
  ```
  
- [ ] **5. Test UI**
  - [ ] Nhấn tab "💼 Hỗ Trợ Công Việc" → Thấy Pomodoro
  - [ ] Nhập note → Nhấn Add → Note xuất hiện
  - [ ] Nhấn chat button → Chat mở ra

---

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

### Báo cáo lỗi chi tiết:

1. **Mở Console (F12)**
2. **Copy TẤT CẢ lỗi đỏ**
3. **Chạy các lệnh:**
   ```javascript
   console.log('=== DEBUG INFO ===');
   console.log('ProductivityTracker:', typeof ProductivityTracker);
   console.log('AIAssistant:', typeof AIAssistant);
   console.log('window.productivityTracker:', window.productivityTracker);
   console.log('window.aiAssistant:', window.aiAssistant);
   ```
4. **Copy kết quả**
5. **Gửi cho tôi**

### Thông tin cần thiết:

- Trình duyệt đang dùng: Chrome / Edge / Firefox?
- Version: ?
- OS: Windows 10 / 11?
- Có lỗi gì trong Console? (Copy toàn bộ)
- test-simple.html có chạy không?

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi debug xong:

```javascript
// Trong Console:
console.log(window.productivityTracker);
// → ProductivityTracker {workSessions: Array(0), ...}

console.log(window.aiAssistant);
// → AIAssistant {tracker: ProductivityTracker, ...}

window.productivityTracker.addWorkNote('Test');
// → undefined (không lỗi)

console.log(window.productivityTracker.workNotes.length);
// → 1
```

**UI:**
- ✅ Tab "Hỗ Trợ Công Việc" → Hiển thị Pomodoro + Notes
- ✅ Tab "Thống Kê" → Hiển thị stats
- ✅ Tab "AI Trợ Lý" → Hiển thị settings
- ✅ Chat button → Mở được chat panel

---

## 📞 LIÊN HỆ

**Nếu làm theo tất cả mà vẫn lỗi:**

1. Mở `test-simple.html`
2. Nhấn F12 → Console
3. Copy TOÀN BỘ output
4. Gửi cho tôi kèm screenshot

**Tôi sẽ giúp debug cụ thể!**

---

**Bắt đầu từ test-simple.html nhé! 🚀**
