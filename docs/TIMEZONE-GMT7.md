# 🌏 Cấu hình Múi giờ GMT+7 (Việt Nam)

## Tổng quan

Ứng dụng đã được cấu hình để sử dụng múi giờ **GMT+7** (Asia/Ho_Chi_Minh - Múi giờ Việt Nam) cho tất cả các chức năng liên quan đến thời gian.

## Các file đã cập nhật

### 1. Frontend (Client-side)

#### `js/timezone-utils.js` - NEW
Utility chính để xử lý timezone GMT+7 cho frontend:
- `nowGMT7()` - Lấy thời gian hiện tại theo GMT+7
- `toGMT7(date)` - Chuyển đổi bất kỳ thời gian nào sang GMT+7
- `toISOStringGMT7()` - Format ISO string với GMT+7
- `toDateStringGMT7()` - Lấy ngày (YYYY-MM-DD) theo GMT+7
- `toLocaleTimeString()` - Format giờ theo định dạng Việt Nam
- `toLocaleDateString()` - Format ngày theo định dạng Việt Nam
- `toLocaleDateTimeString()` - Format ngày giờ theo định dạng Việt Nam
- `getDateRange(days)` - Lấy khoảng thời gian N ngày theo GMT+7
- `formatDuration(seconds)` - Format thời lượng thành chuỗi tiếng Việt
- `getGreeting()` - Lời chào theo giờ Việt Nam

#### `js/config.js`
Thêm cấu hình:
```javascript
TIMEZONE: 'Asia/Ho_Chi_Minh',
TIMEZONE_OFFSET: 7
```

#### `js/api-client.js`
Cập nhật tất cả các hàm sử dụng Date:
- `getEmotionHistory()` - Sử dụng GMT+7
- `getEmotionDistribution()` - Sử dụng GMT+7
- `getDailyStats()` - Sử dụng GMT+7
- `getStatsRange()` - Sử dụng GMT+7
- `startAutoSync()` - Auto-sync với GMT+7

#### `js/ai-assistant.js`
- `provideContextualSuggestions()` - Gợi ý theo giờ GMT+7
- Hiển thị thời gian chat theo GMT+7

#### `js/export-service-pro.js`
- Export PDF với timestamp GMT+7

#### `index.html`
- Timeline hiển thị giờ theo GMT+7
- Import `timezone-utils.js`

### 2. Backend (Server-side)

#### `server-timezone-utils.js` - NEW
Utility cho server Node.js:
- Các hàm tương tự như frontend
- Được sử dụng trong server.js

#### `server.js`
- Request logging với GMT+7
- `/api/ping` endpoint trả về timestamp GMT+7

## Cách sử dụng

### Trong Frontend

```javascript
// Lấy thời gian hiện tại GMT+7
const now = TIMEZONE_UTILS.nowGMT7();

// Chuyển đổi thời gian sang GMT+7
const gmt7Date = TIMEZONE_UTILS.toGMT7(someDate);

// Lấy ISO string GMT+7
const isoString = TIMEZONE_UTILS.toISOStringGMT7();

// Lấy ngày hôm nay (YYYY-MM-DD)
const today = TIMEZONE_UTILS.toDateStringGMT7();

// Format thời gian cho hiển thị
const time = TIMEZONE_UTILS.toLocaleTimeString();
const date = TIMEZONE_UTILS.toLocaleDateString();
const datetime = TIMEZONE_UTILS.toLocaleDateTimeString();

// Lấy khoảng 7 ngày gần đây
const range = TIMEZONE_UTILS.getDateRange(7);
// { startDate, endDate, startDateString, endDateString }

// Format thời lượng
const duration = TIMEZONE_UTILS.formatDuration(3665);
// "1 giờ 1 phút 5 giây"

// Lời chào theo giờ
const greeting = TIMEZONE_UTILS.getGreeting();
// "Chào buổi sáng" / "Chào buổi chiều" / "Chào buổi tối"
```

### Trong Backend (Node.js)

```javascript
const TIMEZONE_UTILS = require('./server-timezone-utils');

// Tương tự như frontend
const now = TIMEZONE_UTILS.nowGMT7();
const isoString = TIMEZONE_UTILS.toISOStringGMT7();
```

## Lưu ý quan trọng

1. **Tất cả thời gian trong ứng dụng đều là GMT+7**
   - Database timestamps vẫn lưu UTC (PostgreSQL mặc định)
   - Chuyển đổi sang GMT+7 khi hiển thị/xử lý

2. **Định dạng thời gian**
   - Sử dụng locale 'vi-VN' cho định dạng Việt Nam
   - Format: DD/MM/YYYY HH:mm:ss

3. **Tính nhất quán**
   - LUÔN sử dụng `TIMEZONE_UTILS` thay vì `new Date()` trực tiếp
   - Đảm bảo tất cả thời gian được hiển thị đúng múi giờ Việt Nam

4. **Testing**
   - Test với các giờ khác nhau trong ngày
   - Kiểm tra chuyển đổi ngày (23:00 -> 00:00)
   - Verify timezone khi deploy production

## Ví dụ thực tế

### Gợi ý theo thời gian
```javascript
// Trong ai-assistant.js
const hour = TIMEZONE_UTILS.getCurrentHour(); // 0-23 GMT+7
if (hour === 12) {
    // Gợi ý ăn trưa lúc 12h GMT+7
}
```

### Hiển thị timeline
```javascript
// Trong index.html
const time = TIMEZONE_UTILS.toLocaleTimeString(record.timestamp);
// Hiển thị: "14:30:45" (theo GMT+7)
```

### Sync dữ liệu
```javascript
// Trong api-client.js
const today = TIMEZONE_UTILS.toDateStringGMT7();
await this.syncStats(today, stats);
// Sync với ngày theo GMT+7
```

## Troubleshooting

**Vấn đề**: Thời gian hiển thị sai múi giờ
- **Giải pháp**: Kiểm tra xem có sử dụng `TIMEZONE_UTILS` không, không dùng `new Date()` trực tiếp

**Vấn đề**: Ngày chuyển sai (ví dụ 23:00 vẫn là ngày hôm trước)
- **Giải pháp**: Sử dụng `toDateStringGMT7()` thay vì `.toISOString().split('T')[0]`

**Vấn đề**: Database timestamp không khớp
- **Giải pháp**: Database lưu UTC, luôn chuyển sang GMT+7 khi đọc/hiển thị

## Tương lai

Có thể mở rộng để hỗ trợ nhiều múi giờ:
- Thêm user preference cho timezone
- Auto-detect timezone từ browser
- Hỗ trợ multiple timezones trong cùng ứng dụng
