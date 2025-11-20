/**
 * Session Model
 * Quản lý phiên làm việc
 */
export class Session {
    constructor(data = {}) {
        this.id = data.id || null;
        this.userId = data.userId || data.user_id || null;
        this.startTime = data.startTime || data.start_time || Date.now();
        this.endTime = data.endTime || data.end_time || null;
        this.duration = data.duration || 0;
        this.emotions = data.emotions || [];
        this.notes = data.notes || [];
        this.isActive = data.isActive !== undefined ? data.isActive : true;
    }

    /**
     * Bắt đầu session mới
     */
    start() {
        this.startTime = Date.now();
        this.isActive = true;
        this.emotions = [];
        this.notes = [];
        console.log('📊 Session started:', this.startTime);
    }

    /**
     * Kết thúc session
     */
    end() {
        this.endTime = Date.now();
        this.duration = this.endTime - this.startTime;
        this.isActive = false;
        console.log('📊 Session ended:', {
            duration: this.getDurationFormatted(),
            emotions: this.emotions.length
        });
    }

    /**
     * Thêm emotion vào session
     */
    addEmotion(emotion) {
        this.emotions.push(emotion);
    }

    /**
     * Thêm note vào session
     */
    addNote(note) {
        this.notes.push({
            timestamp: Date.now(),
            content: note
        });
    }

    /**
     * Lấy thời gian đã làm việc (ms)
     */
    getElapsedTime() {
        if (!this.isActive) {
            return this.duration;
        }
        return Date.now() - this.startTime;
    }

    /**
     * Lấy thời gian formatted
     */
    getDurationFormatted() {
        const ms = this.getElapsedTime();
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
     * Tính toán thống kê emotion
     */
    getEmotionStats() {
        const stats = {};
        this.emotions.forEach(emotion => {
            stats[emotion.emotion] = (stats[emotion.emotion] || 0) + 1;
        });
        return stats;
    }

    /**
     * Lấy emotion chủ đạo
     */
    getDominantEmotion() {
        const stats = this.getEmotionStats();
        let maxCount = 0;
        let dominant = 'neutral';

        Object.entries(stats).forEach(([emotion, count]) => {
            if (count > maxCount) {
                maxCount = count;
                dominant = emotion;
            }
        });

        return dominant;
    }

    /**
     * Chuyển sang object JSON
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            emotions: this.emotions.map(e => e.toJSON ? e.toJSON() : e),
            notes: this.notes,
            isActive: this.isActive
        };
    }
}
