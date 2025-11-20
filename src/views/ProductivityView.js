/**
 * ProductivityView - Quản lý giao diện productivity tracking
 */
export class ProductivityView {
    constructor() {
        this.statsElements = {
            totalWorkTime: null,
            focusedTime: null,
            distractedTime: null,
            focusScore: null,
            pomodoroCount: null
        };
        
        this.timerElement = null;
        this.sessionStatusElement = null;
        
        this.init();
    }

    init() {
        // Stats elements
        this.statsElements.totalWorkTime = document.getElementById('totalWorkTime');
        this.statsElements.focusedTime = document.getElementById('focusedTime');
        this.statsElements.distractedTime = document.getElementById('distractedTime');
        this.statsElements.focusScore = document.getElementById('focusScore');
        this.statsElements.pomodoroCount = document.getElementById('pomodoroCount');
        
        // Timer and session
        this.timerElement = document.getElementById('pomodoroTimer');
        this.sessionStatusElement = document.getElementById('sessionStatus');
    }

    /**
     * Cập nhật thống kê
     */
    updateStats(stats) {
        const formatted = stats.getFormattedStats();
        
        if (this.statsElements.totalWorkTime) {
            this.statsElements.totalWorkTime.textContent = formatted.totalWorkTime;
        }
        if (this.statsElements.focusedTime) {
            this.statsElements.focusedTime.textContent = formatted.focusedTime;
        }
        if (this.statsElements.distractedTime) {
            this.statsElements.distractedTime.textContent = formatted.distractedTime;
        }
        if (this.statsElements.focusScore) {
            this.statsElements.focusScore.textContent = `${formatted.focusScore}%`;
            
            // Update color based on score
            const scoreEl = this.statsElements.focusScore.parentElement;
            if (scoreEl) {
                if (formatted.focusScore >= 80) {
                    scoreEl.style.color = '#4CAF50';
                } else if (formatted.focusScore >= 60) {
                    scoreEl.style.color = '#FF9800';
                } else {
                    scoreEl.style.color = '#F44336';
                }
            }
        }
        if (this.statsElements.pomodoroCount) {
            this.statsElements.pomodoroCount.textContent = formatted.pomodoroCount;
        }
    }

    /**
     * Cập nhật timer
     */
    updateTimer(timeInSeconds, isWorkTime = true) {
        if (this.timerElement) {
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = timeInSeconds % 60;
            const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            this.timerElement.textContent = formatted;
            this.timerElement.style.color = isWorkTime ? '#4CAF50' : '#2196F3';
        }
    }

    /**
     * Hiển thị trạng thái session
     */
    showSessionStatus(message, type = 'info') {
        if (this.sessionStatusElement) {
            const icons = {
                info: 'ℹ️',
                success: '✅',
                warning: '⚠️',
                error: '❌'
            };
            
            this.sessionStatusElement.innerHTML = `${icons[type]} ${message}`;
            this.sessionStatusElement.className = `session-status ${type}`;
        }
    }

    /**
     * Hiển thị gợi ý nghỉ ngơi
     */
    showBreakSuggestion() {
        const message = '🌟 Đã làm việc lâu rồi! Nghỉ ngơi 5 phút nhé!';
        this.showSessionStatus(message, 'warning');
        
        // Optional: Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Thời gian nghỉ ngơi', {
                body: message,
                icon: '/icon.png'
            });
        }
    }

    /**
     * Cập nhật emotion chart
     */
    updateEmotionChart(emotionStats) {
        // Có thể implement Chart.js ở đây
        console.log('Emotion Stats:', emotionStats);
    }
}
