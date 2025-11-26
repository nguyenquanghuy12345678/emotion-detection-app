// ============================================
// PRODUCTIVITY TRACKER - AI HỖ TRỢ CÔNG VIỆC
// ============================================

console.log('🔄 Loading productivity.js...');

class ProductivityTracker {
    constructor() {
        // Trạng thái làm việc
        this.workSessions = [];
        this.currentSession = null;
        this.emotionHistory = [];
        this.focusScore = 100;
        this.breakSuggested = false;
        
        // Tracking real-time
        this.lastEmotionUpdate = Date.now();
        this.noFaceDetectedCount = 0;
        this.sessionStartTime = null;
        this.isActive = false;
        
        // Pomodoro Timer
        this.pomodoroTime = 25 * 60; // 25 phút
        this.breakTime = 5 * 60; // 5 phút
        this.pomodoroCount = 0;
        this.timerInterval = null;
        this.isPomodoroRunning = false;
        this.currentTime = 0;
        this.isWorkTime = true;
        
        // Thống kê real-time
        this.stats = {
            totalWorkTime: 0,
            totalBreakTime: 0,
            focusedTime: 0,
            distractedTime: 0,
            stressTime: 0,
            happyTime: 0,
            sessionStartTime: 0,
            currentSessionTime: 0
        };
        
        // Ghi chú công việc
        this.workNotes = [];
        
        // Theo dõi vắng mặt
        this.absenceLog = [];
        this.lunchBreakTaken = false;
        this.nightWarning = false;
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupUI();
        this.updateStatsDisplay();
        this.startSessionTracking();
    }

    // Trả về thống kê hiện tại cho UI
    getCurrentStats() {
        return {
            totalWorkTime: this.stats.totalWorkTime || 0,
            focusedTime: this.stats.focusedTime || 0,
            distractedTime: this.stats.distractedTime || 0,
            focusScore: this.focusScore || 0
        };
    }
    
    // ============================================
    // SESSION TRACKING - REAL-TIME
    // ============================================
    
    startSessionTracking() {
        // Cập nhật thời gian làm việc mỗi giây
        setInterval(() => {
            if (this.isActive && this.sessionStartTime) {
                const now = Date.now();
                const sessionDuration = Math.floor((now - this.sessionStartTime) / 1000);
                this.stats.currentSessionTime = sessionDuration;
                
                // Cập nhật UI mỗi 5 giây để tránh lag
                if (sessionDuration % 5 === 0) {
                    this.updateStatsDisplay();
                }
            }
        }, 1000);
    }
    
    startSession() {
        if (!this.isActive) {
            this.isActive = true;
            this.sessionStartTime = Date.now();
            this.stats.sessionStartTime = this.sessionStartTime;
            console.log('✅ Productivity session started');
        }
    }
    
    endSession() {
        if (this.isActive) {
            this.isActive = false;
            const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
            this.stats.totalWorkTime += sessionDuration;
            this.sessionStartTime = null;
            this.stats.currentSessionTime = 0;
            this.saveData();
            console.log('⏹️ Productivity session ended');
            
            // Hiển thị thông báo và cập nhật export buttons
            this.showSessionEndNotification(sessionDuration);
            
            // Cập nhật trạng thái export buttons
            if (typeof updateExportButtons === 'function') {
                updateExportButtons();
            }
        }
    }
    
    // ============================================
    // PHÂN TÍCH CẢM XÚC CHO CÔNG VIỆC - OPTIMIZED
    // ============================================
    
    analyzeWorkState(emotion, confidence) {
        const timestamp = Date.now();
        
        // Bắt đầu session nếu chưa active
        if (!this.isActive) {
            this.startSession();
        }
        
        // Reset no face counter
        this.noFaceDetectedCount = 0;
        this.lastEmotionUpdate = timestamp;
        
        // Tính điểm tập trung cho cảm xúc này
        const emotionFocusScore = this.calculateFocusScore(emotion);
        
        // Thêm vào lịch sử
        this.emotionHistory.push({
            emotion,
            confidence,
            timestamp,
            focusScore: emotionFocusScore
        });
        
        // Giữ lịch sử 100 mục gần nhất
        if (this.emotionHistory.length > 100) {
            this.emotionHistory.shift();
        }
        
        // Cập nhật điểm tập trung (smooth transition)
        this.updateFocusScore(emotion);
        
        // Cập nhật thống kê theo cảm xúc
        this.updateEmotionStats(emotion, timestamp);
        
        // Phân tích trạng thái
        const workState = this.getWorkState(emotion);
        this.updateWorkState(workState);
        
        // Kiểm tra cần nghỉ ngơi (throttled - mỗi 10 giây)
        if (!this.lastBreakCheck || timestamp - this.lastBreakCheck > 10000) {
            this.checkBreakNeeded();
            this.lastBreakCheck = timestamp;
        }
        
        // Lưu dữ liệu (throttled - mỗi 30 giây)
        if (!this.lastSave || timestamp - this.lastSave > 30000) {
            this.saveData();
            this.lastSave = timestamp;
        }
        
        return workState;
    }
    
    recordNoFaceDetected() {
        this.noFaceDetectedCount++;
        
        // Nếu không phát hiện khuôn mặt quá lâu (30 giây)
        if (this.noFaceDetectedCount > 30) {
            // Tạm dừng session
            if (this.isActive) {
                console.warn('⚠️ No face detected for 30s - Pausing session');
                this.endSession();
            }
        }
    }
    
    updateEmotionStats(emotion, timestamp) {
        // Cập nhật thời gian cho từng loại cảm xúc
        const focusEmotions = ['neutral', 'happy'];
        const stressEmotions = ['angry', 'disgusted', 'fearful'];
        
        if (focusEmotions.includes(emotion)) {
            this.stats.focusedTime++;
        } else {
            this.stats.distractedTime++;
        }
        
        if (stressEmotions.includes(emotion)) {
            this.stats.stressTime++;
        }
        
        if (emotion === 'happy') {
            this.stats.happyTime++;
        }
    }
    
    calculateFocusScore(emotion) {
        const focusMap = {
            'neutral': 90,
            'happy': 85,
            'surprised': 60,
            'sad': 40,
            'angry': 30,
            'fearful': 25,
            'disgusted': 35
        };
        return focusMap[emotion] || 50;
    }
    
    updateFocusScore(emotion) {
        const emotionScore = this.calculateFocusScore(emotion);
        // Điểm tập trung trung bình trượt
        this.focusScore = (this.focusScore * 0.8) + (emotionScore * 0.2);
    }
    
    getWorkState(emotion) {
        if (['neutral', 'happy'].includes(emotion)) {
            return {
                state: 'focused',
                icon: '🎯',
                message: 'Bạn đang tập trung tốt!',
                color: '#4CAF50'
            };
        } else if (['sad', 'fearful'].includes(emotion)) {
            return {
                state: 'tired',
                icon: '😴',
                message: 'Bạn có vẻ mệt mỏi. Cần nghỉ ngơi?',
                color: '#FF9800'
            };
        } else if (['angry', 'disgusted'].includes(emotion)) {
            return {
                state: 'stressed',
                icon: '😤',
                message: 'Bạn đang căng thẳng. Hít thở sâu nhé!',
                color: '#F44336'
            };
        } else {
            return {
                state: 'distracted',
                icon: '🤔',
                message: 'Bạn có vẻ mất tập trung',
                color: '#2196F3'
            };
        }
    }
    
    updateWorkState(workState) {
        const stateDisplay = document.getElementById('workState');
        if (stateDisplay) {
            stateDisplay.innerHTML = `
                <div class="work-state-card" style="border-left: 4px solid ${workState.color}">
                    <div class="state-icon">${workState.icon}</div>
                    <div class="state-info">
                        <div class="state-label">${workState.state.toUpperCase()}</div>
                        <div class="state-message">${workState.message}</div>
                    </div>
                    <div class="focus-score">
                        <div class="score-label">Điểm tập trung</div>
                        <div class="score-value">${Math.round(this.focusScore)}/100</div>
                    </div>
                </div>
            `;
        }
    }
    
    checkBreakNeeded() {
        // Tính toán thời gian làm việc liên tục
        const recentHistory = this.emotionHistory.slice(-20);
        const avgFocus = recentHistory.reduce((sum, item) => sum + item.focusScore, 0) / recentHistory.length;
        
        // Nếu điểm tập trung thấp và chưa gợi ý nghỉ
        if (avgFocus < 50 && !this.breakSuggested) {
            this.suggestBreak();
        } else if (avgFocus > 70) {
            this.breakSuggested = false;
        }
    }
    
    suggestBreak() {
        this.breakSuggested = true;
        this.showNotification('💡 Gợi ý nghỉ ngơi', 'Bạn đã làm việc lâu rồi. Nghỉ ngơi 5 phút nhé!', 'warning');
        
        // Phát âm thanh nhắc nhở
        this.playSound('notification');
    }
    
    // ============================================
    // POMODORO TIMER
    // ============================================
    
    startPomodoro() {
        if (this.isPomodoroRunning) return;
        
        this.isPomodoroRunning = true;
        this.isWorkTime = true;
        this.currentTime = this.pomodoroTime;
        
        this.updatePomodoroDisplay();
        
        this.timerInterval = setInterval(() => {
            this.currentTime--;
            
            if (this.currentTime <= 0) {
                this.pomodoroComplete();
            }
            
            this.updatePomodoroDisplay();
        }, 1000);
        
        this.showNotification('🍅 Pomodoro Bắt Đầu', 'Tập trung làm việc trong 25 phút!', 'success');
    }
    
    stopPomodoro() {
        this.isPomodoroRunning = false;
        clearInterval(this.timerInterval);
        this.updatePomodoroDisplay();
    }
    
    resetPomodoro() {
        this.stopPomodoro();
        this.currentTime = this.pomodoroTime;
        this.isWorkTime = true;
        this.updatePomodoroDisplay();
    }
    
    pomodoroComplete() {
        if (this.isWorkTime) {
            // Hoàn thành 1 pomodoro
            this.pomodoroCount++;
            this.stats.totalWorkTime += this.pomodoroTime;
            
            this.playSound('complete');
            this.showNotification('✅ Hoàn Thành!', 'Bạn đã hoàn thành 1 Pomodoro! Nghỉ ngơi 5 phút.', 'success');
            
            // Chuyển sang thời gian nghỉ
            this.isWorkTime = false;
            this.currentTime = this.breakTime;
        } else {
            // Hoàn thành nghỉ ngơi
            this.stats.totalBreakTime += this.breakTime;
            
            this.playSound('notification');
            this.showNotification('🎯 Sẵn Sàng!', 'Hết giờ nghỉ. Bắt đầu Pomodoro mới?', 'info');
            
            this.stopPomodoro();
        }
        
        this.saveData();
    }
    
    updatePomodoroDisplay() {
        const display = document.getElementById('pomodoroTimer');
        if (!display) return;
        
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const timeText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const statusText = this.isWorkTime ? '🍅 Làm việc' : '☕ Nghỉ ngơi';
        const progressPercent = this.isWorkTime 
            ? ((this.pomodoroTime - this.currentTime) / this.pomodoroTime) * 100
            : ((this.breakTime - this.currentTime) / this.breakTime) * 100;
        
        display.innerHTML = `
            <div class="pomodoro-card">
                <div class="pomodoro-header">
                    <span class="pomodoro-status">${statusText}</span>
                    <span class="pomodoro-count">Chu kỳ: ${this.pomodoroCount}</span>
                </div>
                <div class="pomodoro-time">${timeText}</div>
                <div class="pomodoro-progress">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="pomodoro-controls">
                    <button onclick="productivityTracker.startPomodoro()" ${this.isPomodoroRunning ? 'disabled' : ''}>
                        ▶️ Bắt đầu
                    </button>
                    <button onclick="productivityTracker.stopPomodoro()" ${!this.isPomodoroRunning ? 'disabled' : ''}>
                        ⏸️ Tạm dừng
                    </button>
                    <button onclick="productivityTracker.resetPomodoro()">
                        🔄 Đặt lại
                    </button>
                </div>
            </div>
        `;
    }
    
    // ============================================
    // GHI CHÚ CÔNG VIỆC
    // ============================================
    
    addWorkNote(note) {
        const noteData = {
            id: Date.now(),
            text: note,
            timestamp: Date.now(),
            emotion: this.emotionHistory.length > 0 
                ? this.emotionHistory[this.emotionHistory.length - 1].emotion 
                : 'neutral',
            focusScore: Math.round(this.focusScore)
        };
        
        this.workNotes.unshift(noteData);
        this.saveData();
        this.updateNotesDisplay();
        
        return noteData;
    }
    
    deleteWorkNote(noteId) {
        this.workNotes = this.workNotes.filter(note => note.id !== noteId);
        this.saveData();
        this.updateNotesDisplay();
    }
    
    updateNotesDisplay() {
        const notesContainer = document.getElementById('workNotes');
        if (!notesContainer) return;
        
        if (this.workNotes.length === 0) {
            notesContainer.innerHTML = '<p class="no-notes">Chưa có ghi chú nào. Thêm ghi chú đầu tiên!</p>';
            return;
        }
        
        const notesHTML = this.workNotes.map(note => {
            const date = new Date(note.timestamp);
            const emotionEmoji = this.getEmotionEmoji(note.emotion);
            
            return `
                <div class="work-note-item">
                    <div class="note-header">
                        <span class="note-emotion">${emotionEmoji}</span>
                        <span class="note-time">${date.toLocaleString('vi-VN')}</span>
                        <button class="note-delete" onclick="productivityTracker.deleteWorkNote(${note.id})">🗑️</button>
                    </div>
                    <div class="note-text">${note.text}</div>
                    <div class="note-footer">
                        <span class="note-focus">Tập trung: ${note.focusScore}/100</span>
                    </div>
                </div>
            `;
        }).join('');
        
        notesContainer.innerHTML = notesHTML;
    }
    
    getEmotionEmoji(emotion) {
        const emojiMap = {
            'happy': '😊',
            'sad': '😢',
            'angry': '😠',
            'surprised': '😮',
            'neutral': '😐',
            'fearful': '😨',
            'disgusted': '🤢'
        };
        return emojiMap[emotion] || '🤖';
    }
    
    // ============================================
    // THỐNG KÊ & BÁO CÁO
    // ============================================
    
    updateStatsDisplay() {
        const statsContainer = document.getElementById('productivityStats');
        if (!statsContainer) return;
        
        // Tính toán thời gian
        const totalTime = this.stats.totalWorkTime + this.stats.currentSessionTime;
        const focusedTime = this.stats.focusedTime;
        const focusRate = totalTime > 0 
            ? ((focusedTime / totalTime) * 100).toFixed(1) 
            : 0;
        
        // Tính thời gian session hiện tại
        const currentSessionDisplay = this.stats.currentSessionTime > 0
            ? `<div class="current-session">📍 Phiên hiện tại: ${this.formatTime(this.stats.currentSessionTime)}</div>`
            : '';
        
        statsContainer.innerHTML = `
            ${currentSessionDisplay}
            <div class="stats-grid">
                <div class="stat-card ${this.isActive ? 'active-session' : ''}">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-label">Tổng thời gian</div>
                    <div class="stat-value">${this.formatTime(totalTime)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-label">Thời gian tập trung</div>
                    <div class="stat-value">${this.formatTime(focusedTime)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-label">Tỷ lệ tập trung</div>
                    <div class="stat-value">${focusRate}%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🍅</div>
                    <div class="stat-label">Pomodoro hoàn thành</div>
                    <div class="stat-value">${this.pomodoroCount}</div>
                </div>
            </div>
        `;
    }
    
    generateEmotionChart() {
        // Phân tích phân bố cảm xúc
        const emotionCounts = {};
        this.emotionHistory.forEach(item => {
            emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
        });
        
        const chartData = Object.entries(emotionCounts).map(([emotion, count]) => ({
            emotion,
            count,
            percentage: ((count / this.emotionHistory.length) * 100).toFixed(1)
        }));
        
        return chartData;
    }
    
    // ============================================
    // TIỆN ÍCH
    // ============================================
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
    
    playSound(type) {
        // Tạo âm thanh đơn giản
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'notification') {
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
        } else if (type === 'complete') {
            oscillator.frequency.value = 1000;
            gainNode.gain.value = 0.3;
        }
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    showNotification(title, message, type = 'info') {
        // Tạo notification UI
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-header">${title}</div>
            <div class="notification-body">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Tự động xóa sau 5 giây
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Browser notification (nếu được phép)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message });
        }
    }
    
    setupUI() {
        // Yêu cầu quyền notification
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    // ============================================
    // LƯU TRỮ DỮ LIỆU
    // ============================================
    
    saveData() {
        const data = {
            stats: this.stats,
            workNotes: this.workNotes,
            pomodoroCount: this.pomodoroCount,
            emotionHistory: this.emotionHistory.slice(-50), // Lưu 50 mục gần nhất
            focusScore: this.focusScore,
            absenceLog: this.absenceLog
        };
        
        localStorage.setItem('productivityData', JSON.stringify(data));
    }
    
    loadData() {
        try {
            const savedData = localStorage.getItem('productivityData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.stats = data.stats || this.stats;
                this.workNotes = data.workNotes || [];
                this.pomodoroCount = data.pomodoroCount || 0;
                this.emotionHistory = data.emotionHistory || [];
                this.focusScore = data.focusScore || 100;
                this.absenceLog = data.absenceLog || [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    resetData() {
        if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác!')) {
            localStorage.removeItem('productivityData');
            window.location.reload();
        }
    }
    
    recordAbsence(timestamp) {
        this.absenceLog.push({
            timestamp,
            duration: 0,
            endTime: null
        });
        this.saveData();
    }
    
    exportData() {
        const data = {
            stats: this.stats,
            workNotes: this.workNotes,
            emotionHistory: this.emotionHistory,
            absenceLog: this.absenceLog,
            focusScore: this.focusScore,
            pomodoroCount: this.pomodoroCount,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productivity-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // ============================================
    // NOTIFICATION KHI KẾT THÚC PHIÊN LÀM VIỆC
    // ============================================
    
    showSessionEndNotification(sessionDuration) {
        // Format thời lượng
        const hours = Math.floor(sessionDuration / 3600);
        const minutes = Math.floor((sessionDuration % 3600) / 60);
        const seconds = sessionDuration % 60;
        
        let durationText = '';
        if (hours > 0) durationText += `${hours} giờ `;
        if (minutes > 0) durationText += `${minutes} phút `;
        if (seconds > 0 || durationText === '') durationText += `${seconds} giây`;
        
        // Tạo notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            max-width: 500px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">Phiên làm việc đã kết thúc!</h2>
            <p style="margin: 10px 0; font-size: 16px;">
                Thời lượng làm việc: <strong>${durationText}</strong>
            </p>
            <p style="margin: 10px 0; font-size: 16px;">
                Điểm tập trung: <strong>${Math.round(this.focusScore)}/100</strong>
            </p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3);">
                <p style="font-size: 14px; margin: 10px 0;">
                    ✨ Bạn có thể xuất báo cáo PDF ngay bây giờ!
                </p>
                <button onclick="this.parentElement.parentElement.parentElement.remove(); exportProductivityReport('pdf')" 
                        style="background: #00ff00; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; margin: 5px;">
                    📄 Xuất PDF ngay
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; margin: 5px;">
                    Đóng
                </button>
            </div>
        `;
        
        // Thêm animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -60%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Tự động đóng sau 10 giây
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
        
        console.log('✅ Session end notification displayed');
    }
}

// Khởi tạo ProductivityTracker với nhiều cách fallback
(function() {
    console.log('🚀 ProductivityTracker script loading...');
    console.log('📊 DOM ready state:', document.readyState);
    
    // Expose class globally ngay lập tức
    if (typeof window === 'undefined') {
        console.error('❌ Window object not available');
        return;
    }
    
    window.ProductivityTracker = ProductivityTracker;
    console.log('✅ ProductivityTracker class exposed globally');
    
    function createProductivityTracker() {
        if (typeof window.productivityTracker !== 'undefined') {
            console.log('⚠️ ProductivityTracker instance already exists');
            return;
        }
        
        try {
            console.log('🔧 Creating new ProductivityTracker instance...');
            window.productivityTracker = new ProductivityTracker();
            console.log('✅ ProductivityTracker instance created successfully!');
            console.log('📋 Instance type:', typeof window.productivityTracker);
            console.log('🔍 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.productivityTracker)).slice(0, 10));
            
            // Test method
            if (typeof window.productivityTracker.getCurrentStats === 'function') {
                console.log('✅ getCurrentStats method is available');
            } else {
                console.error('❌ getCurrentStats method is NOT available');
            }
            
        } catch (error) {
            console.error('❌ CRITICAL: Failed to create ProductivityTracker instance:', error);
            console.error('Error stack:', error.stack);
        }
    }
    
    // Thử khởi tạo ngay lập tức
    if (document.readyState === 'loading') {
        console.log('📄 Document is loading, waiting for DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', createProductivityTracker);
    } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
        console.log('📄 Document ready, creating instance immediately...');
        createProductivityTracker();
    }
    
    // Backup: khởi tạo sau 100ms nếu chưa có
    setTimeout(() => {
        if (typeof window.productivityTracker === 'undefined') {
            console.log('⏰ Backup initialization after 100ms...');
            createProductivityTracker();
        }
    }, 100);
    
    // Backup cuối cùng: khởi tạo sau 1s
    setTimeout(() => {
        if (typeof window.productivityTracker === 'undefined') {
            console.log('🚨 Final fallback initialization after 1s...');
            createProductivityTracker();
        }
    }, 1000);
    
})();
