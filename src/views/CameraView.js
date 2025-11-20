/**
 * CameraView - Quản lý giao diện camera và video
 */
export class CameraView {
    constructor() {
        this.videoElement = null;
        this.canvasElement = null;
        this.statusElement = null;
        this.emotionDisplayElement = null;
        
        this.init();
    }

    init() {
        this.videoElement = document.getElementById('videoElement');
        this.canvasElement = document.getElementById('overlay');
        this.statusElement = document.getElementById('status');
        this.emotionDisplayElement = document.getElementById('emotionDisplay');
    }

    /**
     * Hiển thị trạng thái
     */
    showStatus(message, type = 'info') {
        if (this.statusElement) {
            const icons = {
                info: 'ℹ️',
                success: '✅',
                warning: '⚠️',
                error: '❌'
            };
            
            this.statusElement.innerHTML = `${icons[type]} ${message}`;
            this.statusElement.className = `status ${type}`;
        }
    }

    /**
     * Hiển thị emotion hiện tại
     */
    showEmotion(emotion) {
        if (this.emotionDisplayElement && emotion) {
            const emoji = emotion.getEmoji();
            const color = emotion.getColor();
            const confidence = Math.round(emotion.confidence * 100);
            
            this.emotionDisplayElement.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 10px;">${emoji}</div>
                <div style="color: ${color}; font-size: 20px; font-weight: bold;">
                    ${emotion.emotion.toUpperCase()}
                </div>
                <div style="font-size: 14px; color: #666; margin-top: 5px;">
                    ${confidence}% confidence
                </div>
            `;
        }
    }

    /**
     * Vẽ khung face detection
     */
    drawFaceBox(detection) {
        if (!this.canvasElement || !this.videoElement) return;

        const ctx = this.canvasElement.getContext('2d');
        const displaySize = {
            width: this.videoElement.videoWidth,
            height: this.videoElement.videoHeight
        };

        // Resize canvas to match video
        this.canvasElement.width = displaySize.width;
        this.canvasElement.height = displaySize.height;

        // Clear previous drawings
        ctx.clearRect(0, 0, displaySize.width, displaySize.height);

        if (detection) {
            const box = detection.detection.box;
            
            // Draw rectangle
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
        }
    }

    /**
     * Clear canvas
     */
    clearCanvas() {
        if (this.canvasElement) {
            const ctx = this.canvasElement.getContext('2d');
            ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        }
    }

    /**
     * Lấy video element
     */
    getVideoElement() {
        return this.videoElement;
    }

    /**
     * Lấy canvas element
     */
    getCanvasElement() {
        return this.canvasElement;
    }
}
