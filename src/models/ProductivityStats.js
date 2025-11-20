/**
 * ProductivityStats Model
 * Quản lý thống kê năng suất làm việc
 */
export class ProductivityStats {
    constructor(data = {}) {
        this.totalWorkTime = data.totalWorkTime || 0;
        this.totalBreakTime = data.totalBreakTime || 0;
        this.focusedTime = data.focusedTime || 0;
        this.distractedTime = data.distractedTime || 0;
        this.stressTime = data.stressTime || 0;
        this.happyTime = data.happyTime || 0;
        this.pomodoroCount = data.pomodoroCount || 0;
        this.sessionCount = data.sessionCount || 0;
    }

    /**
     * Cập nhật thống kê từ emotion
     */
    updateFromEmotion(emotion, duration = 1000) {
        // Update total work time
        this.totalWorkTime += duration;

        // Update based on emotion type
        if (emotion.isFocused()) {
            this.focusedTime += duration;
        } else if (emotion.isDistracted()) {
            this.distractedTime += duration;
        }

        // Update emotion-specific times
        if (emotion.emotion === 'happy') {
            this.happyTime += duration;
        } else if (['sad', 'angry', 'fearful'].includes(emotion.emotion)) {
            this.stressTime += duration;
        }
    }

    /**
     * Thêm break time
     */
    addBreakTime(duration) {
        this.totalBreakTime += duration;
    }

    /**
     * Tăng Pomodoro count
     */
    incrementPomodoro() {
        this.pomodoroCount++;
    }

    /**
     * Tăng session count
     */
    incrementSession() {
        this.sessionCount++;
    }

    /**
     * Tính focus score (0-100)
     */
    getFocusScore() {
        if (this.totalWorkTime === 0) return 100;
        const focusPercentage = (this.focusedTime / this.totalWorkTime) * 100;
        return Math.round(Math.min(100, Math.max(0, focusPercentage)));
    }

    /**
     * Lấy thời gian formatted
     */
    getFormattedTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Lấy tất cả stats formatted
     */
    getFormattedStats() {
        return {
            totalWorkTime: this.getFormattedTime(this.totalWorkTime),
            totalBreakTime: this.getFormattedTime(this.totalBreakTime),
            focusedTime: this.getFormattedTime(this.focusedTime),
            distractedTime: this.getFormattedTime(this.distractedTime),
            stressTime: this.getFormattedTime(this.stressTime),
            happyTime: this.getFormattedTime(this.happyTime),
            focusScore: this.getFocusScore(),
            pomodoroCount: this.pomodoroCount,
            sessionCount: this.sessionCount
        };
    }

    /**
     * Reset tất cả stats
     */
    reset() {
        this.totalWorkTime = 0;
        this.totalBreakTime = 0;
        this.focusedTime = 0;
        this.distractedTime = 0;
        this.stressTime = 0;
        this.happyTime = 0;
        this.pomodoroCount = 0;
        this.sessionCount = 0;
    }

    /**
     * Chuyển sang object JSON
     */
    toJSON() {
        return {
            totalWorkTime: this.totalWorkTime,
            totalBreakTime: this.totalBreakTime,
            focusedTime: this.focusedTime,
            distractedTime: this.distractedTime,
            stressTime: this.stressTime,
            happyTime: this.happyTime,
            pomodoroCount: this.pomodoroCount,
            sessionCount: this.sessionCount,
            focusScore: this.getFocusScore()
        };
    }
}
