# 🧪 Testing Guide - Complete Data Flow Verification

## Test Environment

- **Local**: http://localhost:3000
- **Production**: https://your-app.vercel.app

## Pre-Test Setup

```bash
# 1. Initialize database
node init-database.js

# 2. Run pre-deployment check
node pre-deploy-check.js

# 3. Start local server
node server.js
```

## Test Suite

### 🎯 Test 1: Guest Mode (Not Logged In)

**Objective**: Verify guest users can use app without authentication

**Steps**:
1. Open http://localhost:3000
2. Do NOT click "Đăng nhập" or "Đăng ký"
3. Click "Bắt đầu phát hiện"
4. Allow camera access
5. Wait for emotion detection (30 seconds)
6. Click "Xuất PDF"

**Expected Results**:
- ✅ Camera works without login
- ✅ Emotions detected and displayed
- ✅ PDF exports successfully
- ✅ PDF shows:
  ```
  Người dùng: Khách
  Email: guest@local
  ID: guest
  ```
- ✅ Data from localStorage only (not database)

**Verification**:
```javascript
// Browser Console
console.log(localStorage.getItem('user'));
// Should be null or undefined

console.log(localStorage.getItem('authToken'));
// Should be null or undefined
```

---

### 🎯 Test 2: User Registration

**Objective**: Verify complete user data is stored

**Steps**:
1. Refresh page (clear previous session)
2. Click "Đăng ký"
3. Fill in form:
   - Họ tên: **Nguyễn Văn A**
   - Email: **test@example.com**
   - Mật khẩu: **test123**
4. Click "Đăng ký"

**Expected Results**:
- ✅ Registration successful
- ✅ Redirected to main app
- ✅ Welcome message shows: "Xin chào, Nguyễn Văn A!"

**Verification in Browser Console**:
```javascript
// Check localStorage
console.log(localStorage.getItem('userId'));
// Output: 1 (or some number)

console.log(localStorage.getItem('userEmail'));
// Output: test@example.com

console.log(localStorage.getItem('userName'));
// Output: Nguyễn Văn A

console.log(localStorage.getItem('authToken'));
// Output: eyJhbGciOiJIUzI1NiIsInR5cCI... (JWT token)

// Check API client
console.log(window.apiClient.getCurrentUser());
/* Output:
{
  id: 1,
  email: "test@example.com",
  full_name: "Nguyễn Văn A",
  created_at: "2025-11-20T...",
  isGuest: false
}
*/
```

**Verification in Database**:
```sql
-- Connect to Neon database
SELECT * FROM users WHERE email = 'test@example.com';
/* Expected:
id | email              | full_name     | password_hash | created_at
1  | test@example.com   | Nguyễn Văn A  | $2a$10$...    | 2025-11-20...
*/
```

---

### 🎯 Test 3: User Login

**Objective**: Verify login restores complete user data

**Steps**:
1. Open new incognito window
2. Go to http://localhost:3000
3. Click "Đăng nhập"
4. Enter:
   - Email: **test@example.com**
   - Mật khẩu: **test123**
5. Click "Đăng nhập"

**Expected Results**:
- ✅ Login successful
- ✅ Welcome message: "Xin chào, Nguyễn Văn A!"
- ✅ Same localStorage data as registration

**Verification**:
```javascript
console.log(window.apiClient.getCurrentUser());
/* Should show SAME data:
{
  id: 1,
  email: "test@example.com",
  full_name: "Nguyễn Văn A",
  isGuest: false
}
*/
```

---

### 🎯 Test 4: Emotion Detection (Logged In)

**Objective**: Verify emotions are saved to database

**Steps**:
1. Ensure logged in as Nguyễn Văn A
2. Click "Bắt đầu phát hiện"
3. Allow camera
4. Show different emotions to camera:
   - 😊 Happy (10 seconds)
   - 😐 Neutral (10 seconds)
   - 😟 Sad (10 seconds)
5. Click "Dừng phát hiện"

**Expected Results**:
- ✅ Emotions detected and displayed
- ✅ Stats updated in real-time
- ✅ Session ID created

**Verification in Database**:
```sql
-- Check session created
SELECT * FROM work_sessions WHERE user_id = 1;
/* Expected:
session_id | user_id | start_time         | end_time | total_time
1          | 1       | 2025-11-20 10:00  | NULL     | NULL
*/

-- Check emotions recorded
SELECT COUNT(*) FROM emotion_history WHERE session_id = 1;
-- Expected: ~30 records (one per second for 30 seconds)

SELECT emotion, COUNT(*) as count 
FROM emotion_history 
WHERE session_id = 1 
GROUP BY emotion;
/* Expected:
emotion  | count
happy    | ~10
neutral  | ~10
sad      | ~10
*/
```

**Verification via API**:
```javascript
// Browser Console
fetch('/api/productivity/stats', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('Total emotions:', data.data.emotionHistory.length);
  console.log('User info:', data.data.user);
  console.log('Total work time:', data.data.totalWorkTime);
});
```

---

### 🎯 Test 5: PDF Export (Logged In - CRITICAL)

**Objective**: Verify PDF shows REAL user data from database

**Steps**:
1. After Test 4 (with ~30 emotions recorded)
2. Click "Xuất PDF"
3. Open downloaded PDF

**Expected Results**:
- ✅ PDF filename: `Productivity_Report_NguynVnA_20251120.pdf`
- ✅ PDF shows REAL user info:
  ```
  BÁO CÁO NĂNG SUẤT LÀM VIỆC

  Người dùng: Nguyễn Văn A
  Email: test@example.com
  ID: 1
  Thời gian: [từ lúc bắt đầu session]
  Ngày xuất: 20/11/2025
  ```
- ✅ Stats section shows:
  - Tổng thời gian làm việc: ~30 giây
  - Thời gian tập trung: X giây
  - Phân bố cảm xúc (pie chart)
- ✅ Emotion history table with ~30 rows
- ✅ Professional formatting with colors

**Verification - Data Source**:
```javascript
// Before clicking export, check what data will be fetched
await window.professionalExportService.fetchProductivityData();
/* Output should show:
{
  user: {
    id: 1,
    email: "test@example.com",
    full_name: "Nguyễn Văn A",
    created_at: "...",
    last_login: "..."
  },
  totalWorkTime: 30,
  emotionHistory: [...30 records from database...],
  workSessions: [...],
  emotionDistribution: { happy: 10, neutral: 10, sad: 10 }
}
*/
```

**Database Verification**:
```sql
-- Check export logged
SELECT * FROM export_history WHERE user_id = 1;
/* Expected:
export_id | user_id | export_type | filename               | created_at
1         | 1       | pdf         | Productivity_Report... | 2025-11-20...
*/
```

---

### 🎯 Test 6: Guest vs Authenticated Comparison

**Objective**: Verify different behavior for guest vs logged in

**Side-by-Side Test**:

| Feature | Guest Mode | Logged In (Nguyễn Văn A) |
|---------|-----------|--------------------------|
| **Camera** | ✅ Works | ✅ Works |
| **Emotion Detection** | ✅ Shows in UI | ✅ Shows in UI |
| **Data Storage** | localStorage only | Database (Neon) |
| **PDF - User Name** | "Khách" | "Nguyễn Văn A" |
| **PDF - Email** | "guest@local" | "test@example.com" |
| **PDF - ID** | "guest" | "1" |
| **PDF - Data Source** | localStorage | Backend API |
| **Export History** | ❌ Not logged | ✅ Logged to DB |
| **Session Tracking** | ❌ No | ✅ Yes (work_sessions) |
| **Cross-Device** | ❌ No (lost on clear) | ✅ Yes (in database) |

---

### 🎯 Test 7: Data Accuracy

**Objective**: Verify stats in PDF match database

**Steps**:
1. Start session
2. Detect 20 emotions:
   - 10 happy
   - 6 neutral
   - 4 sad
3. Export PDF
4. Compare PDF vs Database

**Verification**:
```sql
-- Database query
SELECT 
  COUNT(*) as total_emotions,
  SUM(CASE WHEN emotion = 'happy' THEN 1 ELSE 0 END) as happy_count,
  SUM(CASE WHEN emotion = 'neutral' THEN 1 ELSE 0 END) as neutral_count,
  SUM(CASE WHEN emotion = 'sad' THEN 1 ELSE 0 END) as sad_count,
  SUM(focus_score) / COUNT(*) as avg_focus
FROM emotion_history
WHERE session_id = 1;
```

**PDF should show EXACT same numbers**:
- Total: 20
- Happy: 10 (50%)
- Neutral: 6 (30%)
- Sad: 4 (20%)
- Average focus: X%

---

### 🎯 Test 8: Production Deployment (Vercel)

**Objective**: Verify same behavior on Vercel

**Prerequisites**:
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - JWT_SECRET
```

**Test Steps**:
1. Open https://your-app.vercel.app
2. Repeat Test 2 (Registration) with NEW email
3. Repeat Test 4 (Emotion Detection)
4. Repeat Test 5 (PDF Export)

**Expected Results**:
- ✅ Same behavior as localhost
- ✅ User data in Neon database
- ✅ PDF shows real user info
- ✅ All API endpoints work

**API Endpoint Tests**:
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Register
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "production@test.com",
    "password": "test123",
    "fullName": "Production User"
  }'

# Login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "production@test.com",
    "password": "test123"
  }'
# Save the token from response

# Get stats
curl https://your-app.vercel.app/api/productivity/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Common Issues & Fixes

### Issue 1: PDF shows "Khách" even when logged in

**Diagnosis**:
```javascript
console.log(localStorage.getItem('authToken')); // Should NOT be null
console.log(window.apiClient.isAuthenticated()); // Should be true
```

**Fix**:
- Logout and login again
- Check localStorage has userId, userEmail, userName

### Issue 2: PDF has no data

**Diagnosis**:
```javascript
const token = localStorage.getItem('authToken');
fetch('/api/productivity/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

**Fix**:
- Ensure session was started
- Check database has emotion records
- Verify API endpoint works

### Issue 3: Database not updating

**Diagnosis**:
```sql
SELECT COUNT(*) FROM emotion_history;
SELECT COUNT(*) FROM work_sessions;
```

**Fix**:
- Check DATABASE_URL in environment
- Run `node init-database.js`
- Check server.js logs for errors

---

## Success Criteria Checklist

### ✅ Guest Mode
- [ ] Can use app without login
- [ ] PDF exports with "Khách" user
- [ ] Data from localStorage only

### ✅ Registration
- [ ] Creates user in database
- [ ] Stores complete data (id, email, full_name)
- [ ] Sets all localStorage items (5 items)
- [ ] Welcome message shows real name

### ✅ Login
- [ ] Restores user data
- [ ] Sets authToken
- [ ] Welcome message shows real name
- [ ] Can access authenticated features

### ✅ Emotion Detection (Authenticated)
- [ ] Emotions save to database
- [ ] Session ID created
- [ ] Real-time stats update
- [ ] Data persists after page refresh

### ✅ PDF Export (Authenticated)
- [ ] Shows REAL user name (not "Khách")
- [ ] Shows REAL email
- [ ] Shows REAL user ID
- [ ] Data from database (not localStorage)
- [ ] Stats are accurate
- [ ] Export logged to database

### ✅ Production (Vercel)
- [ ] All features work same as localhost
- [ ] API endpoints accessible
- [ ] Database connections work
- [ ] CORS configured properly
- [ ] Environment variables set

---

**Last Updated**: November 20, 2025
