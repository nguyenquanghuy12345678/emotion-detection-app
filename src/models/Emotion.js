/**
 * Emotion Model
 * Quản lý dữ liệu cảm xúc được phát hiện
 */
export class Emotion {
    constructor(data = {}) {
        this.timestamp = data.timestamp || Date.now();
        this.emotion = data.emotion || 'neutral';
        this.confidence = data.confidence || 0;
        this.detections = data.detections || {};
        this.sessionId = data.sessionId || data.session_id || null;
    }

    /**
     * Emotion types mapping
     */
    static TYPES = {
        HAPPY: 'happy',
        SAD: 'sad',
        ANGRY: 'angry',
        FEARFUL: 'fearful',
        DISGUSTED: 'disgusted',
        SURPRISED: 'surprised',
        NEUTRAL: 'neutral'
    };

    /**
     * Kiểm tra emotion có phải là tích cực không
     */
    isPositive() {
        return ['happy', 'surprised'].includes(this.emotion);
    }

    /**
     * Kiểm tra emotion có phải là tiêu cực không
     */
    isNegative() {
        return ['sad', 'angry', 'fearful', 'disgusted'].includes(this.emotion);
    }

    /**
     * Kiểm tra có đang tập trung không
     */
    isFocused() {
        return ['neutral', 'happy'].includes(this.emotion) && this.confidence > 0.6;
    }

    /**
     * Kiểm tra có bị phân tâm không
     */
    isDistracted() {
        return this.isNegative() || this.confidence < 0.4;
    }

    /**
     * Lấy emoji cho emotion
     */
    getEmoji() {
        const emojiMap = {
            happy: '😊',
            sad: '😢',
            angry: '😠',
            fearful: '😨',
            disgusted: '🤢',
            surprised: '😲',
            neutral: '😐'
        };
        return emojiMap[this.emotion] || '😐';
    }

    /**
     * Lấy màu sắc cho emotion
     */
    getColor() {
        const colorMap = {
            happy: '#4CAF50',
            sad: '#2196F3',
            angry: '#F44336',
            fearful: '#9C27B0',
            disgusted: '#795548',
            surprised: '#FF9800',
            neutral: '#607D8B'
        };
        return colorMap[this.emotion] || '#607D8B';
    }

    /**
     * Chuyển sang object JSON
     */
    toJSON() {
        return {
            timestamp: this.timestamp,
            emotion: this.emotion,
            confidence: this.confidence,
            detections: this.detections,
            sessionId: this.sessionId
        };
    }
}
