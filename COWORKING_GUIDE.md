# 🚀 Virtual Co-working Space + Share Features

## 📋 TÍNH NĂNG MỚI

### 1. 👥 Virtual Co-working Space
- **Tạo phòng làm việc ảo**: Làm việc cùng người khác
- **Shared Pomodoro Timer**: Đồng bộ thời gian làm việc
- **Group Chat**: Trò chuyện nhóm real-time
- **Peer Accountability**: Cam kết mục tiêu với nhau
- **Live Stats**: Thống kê nhóm theo thời gian thực

### 2. 📤 Universal Share System
- **Chia sẻ cảm xúc**: Lên Facebook, Twitter, LinkedIn
- **Chia sẻ năng suất**: Xuất báo cáo HTML
- **Chia sẻ ảnh chụp**: Snapshot với metadata
- **Chia sẻ phòng**: Link mời bạn bè

### 3. 📊 Export Reports
- **Báo cáo co-working**: Với ảnh thành viên
- **Báo cáo năng suất đầy đủ**: Bao gồm ảnh chụp cảm xúc
- **Format HTML**: Đẹp, responsive, có thể in
- **Có thể chuyển sang PDF**: Dùng trình duyệt Print to PDF

---

## 🎮 CÁCH SỬ DỤNG

### Virtual Co-working Space

#### Tạo phòng mới:
1. Click tab **"👥 Co-working"**
2. Click **"➕ Tạo Phòng Mới"**
3. Nhập tên phòng
4. Bắt đầu làm việc!

#### Mời bạn bè:
1. Trong phòng, click nút **"🔗"** (Chia sẻ)
2. Copy link hoặc share trực tiếp
3. Bạn bè click link → tự động join phòng

#### Sử dụng Pomodoro chung:
1. Click **"▶️"** để bắt đầu
2. Timer đồng bộ cho tất cả thành viên
3. Khi hết giờ → tự động chuyển sang nghỉ
4. Click **"⏸️"** để tạm dừng

#### Chat & Mục tiêu:
1. Gõ tin nhắn ở ô chat → Enter
2. Đặt mục tiêu → Click **"✅ Đặt mục tiêu"**
3. Tick vào checkbox khi hoàn thành
4. Tất cả thành viên đều thấy

#### Xuất báo cáo phòng:
1. Click nút **"📊"** trên header
2. Báo cáo HTML tự động download
3. Bao gồm:
   - Thống kê nhóm
   - Danh sách thành viên + ảnh avatar
   - Lịch sử chat
   - Mục tiêu đã đặt

---

### Share Features

#### Chia sẻ cảm xúc hiện tại:
1. Ở tab **"🎭 Nhận Diện Cảm Xúc"**
2. Click **"🔗 Chia sẻ cảm xúc"**
3. Chọn nền tảng: Facebook/Twitter/LinkedIn
4. Hoặc copy text vào clipboard

#### Xuất báo cáo năng suất:
1. Ở tab **"💼 Hỗ Trợ Công Việc"**
2. Scroll xuống phần **"📤 Chia Sẻ & Xuất"**
3. Click **"📊 Xuất báo cáo đầy đủ"**
4. File HTML tự động tải về
5. Mở file → In hoặc Save as PDF

#### Chia sẻ ảnh snapshot:
1. Ở tab **"📸 Thư Viện"** (nếu đã cài)
2. Click vào ảnh
3. Click **"📤 Chia sẻ"**
4. Chọn app để share

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

```
js/
├── coworking-space.js     ← Core logic phòng làm việc
├── share-manager.js       ← Quản lý tất cả tính năng share
└── [existing files]

css/
├── coworking.css          ← UI styles cho co-working
└── [existing files]
```

### Data Flow:

```
User Actions
    ↓
CoworkingSpace Class
    ↓
localStorage (Demo mode)
    ↓
Auto-sync every 2s
    ↓
Update UI for all users
```

**Lưu ý**: Demo dùng `localStorage`. Để production thực sự, cần:
- WebSocket server (Socket.io)
- Database (Firebase/MongoDB)
- Hoặc P2P connection (WebRTC)

---

## 🔧 CUSTOMIZATION

### Thay đổi thời gian Pomodoro:
```javascript
// Trong coworking-space.js, line ~50
pomodoro: {
    time: 1500, // 25 phút → Đổi thành 1200 cho 20 phút
    isRunning: false,
    session: 'work'
}
```

### Thay đổi màu theme:
```css
/* Trong coworking.css */
.btn-primary {
    background: linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2);
}
```

### Thêm nền tảng share mới:
```javascript
// Trong share-manager.js
shareToInstagram(text) {
    // Your implementation
}
```

---

## 📱 RESPONSIVE

- ✅ Desktop: Grid layout 2 cột
- ✅ Tablet: 1 cột, sidebar thu gọn
- ✅ Mobile: Full stack, optimized touch

---

## 🐛 TROUBLESHOOTING

### Không thấy tab Co-working?
→ Kiểm tra file `coworking-space.js` đã load chưa (F12 → Console)

### Không share được?
→ Kiểm tra HTTPS (Web Share API cần HTTPS)

### Phòng không sync?
→ Mở cùng browser, cùng localStorage key
→ Production cần WebSocket server

### Báo cáo không download?
→ Kiểm tra popup blocker
→ Allow download trong browser settings

---

## 🚀 NÂNG CẤP LÊN PRODUCTION

### 1. Backend Setup (Node.js + Socket.io)

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = new Map();

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userData) => {
        socket.join(roomId);
        
        if (!rooms.has(roomId)) {
            rooms.set(roomId, { members: [], pomodoro: {} });
        }
        
        const room = rooms.get(roomId);
        room.members.push(userData);
        
        io.to(roomId).emit('user-joined', userData);
        io.to(roomId).emit('room-update', room);
    });
    
    socket.on('pomodoro-start', (roomId) => {
        io.to(roomId).emit('pomodoro-sync', { action: 'start' });
    });
    
    // ... more events
});

server.listen(3000);
```

### 2. Deploy lên Cloud

**Option 1: Heroku**
```bash
heroku create your-app-name
git push heroku main
```

**Option 2: Vercel**
```bash
vercel deploy
```

**Option 3: Railway**
```bash
railway login
railway init
railway up
```

### 3. Database (Firebase Realtime)

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';

const db = getDatabase();

// Save room
set(ref(db, 'rooms/' + roomId), roomData);

// Listen changes
onValue(ref(db, 'rooms/' + roomId), (snapshot) => {
    const data = snapshot.val();
    this.updateRoom(data);
});
```

---

## 📚 DOCUMENTATION

### API Reference

#### CoworkingSpace Class

```javascript
// Create room
coworkingSpace.createRoom()

// Join room
coworkingSpace.joinRoom(roomId)

// Leave room
coworkingSpace.leaveRoom()

// Start shared pomodoro
coworkingSpace.startSharedPomodoro()

// Send message
coworkingSpace.sendMessage()

// Set goal
coworkingSpace.setGoal()

// Export report
coworkingSpace.exportRoomReport()
```

#### ShareManager Class

```javascript
// Share emotion
shareManager.shareCurrentEmotion()

// Share productivity
shareManager.shareProductivityReport()

// Export full report
shareManager.exportFullReport()

// Export co-working report
shareManager.exportCoworkingReport(room, myId)
```

---

## 🎉 DEMO SCENARIOS

### Scenario 1: Học nhóm
1. Tạo phòng "Study Group"
2. 4 người join
3. Đặt mục tiêu: "Học xong Chapter 5"
4. Pomodoro 25 phút
5. Chat hỏi đáp
6. Xuất báo cáo khi xong

### Scenario 2: Remote Team
1. Tạo phòng "Morning Standup"
2. Team join từ nhà
3. Mỗi người đặt task hôm nay
4. Làm việc 2 Pomodoro
5. Check progress qua chat
6. Export report gửi manager

### Scenario 3: Accountability Partner
1. Tạo phòng riêng với bạn
2. Cam kết mục tiêu tuần
3. Làm việc song song
4. Động viên nhau qua chat
5. Track tiến độ daily

---

## 🌟 FUTURE ENHANCEMENTS

- [ ] Video call integration (WebRTC)
- [ ] Voice chat
- [ ] Screen sharing
- [ ] Whiteboard collaboration
- [ ] Task management board
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] AI auto-scheduling
- [ ] Spotify integration
- [ ] GitHub commits tracking

---

## 📞 SUPPORT

Có câu hỏi? Mở issue trên GitHub hoặc liên hệ qua email!

**Author**: Your Name  
**Version**: 1.0.0  
**Last Updated**: November 5, 2025
