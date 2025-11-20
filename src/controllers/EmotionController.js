/**
 * EmotionController - Điều khiển emotion detection
 */
import { CameraService } from '../services/CameraService.js';
import { EmotionDetectionService } from '../services/EmotionDetectionService.js';
import { CameraView } from '../views/CameraView.js';

export class EmotionController {
    constructor(apiService) {
        this.apiService = apiService;
        this.cameraService = new CameraService();
        this.emotionService = new EmotionDetectionService();
        this.view = new CameraView();
        
        this.currentEmotion = null;
        this.emotionHistory = [];
        this.isRunning = false;
        
        this.onEmotionDetected = null; // Callback
    }

    /**
     * Khởi động camera và detection
     */
    async start() {
        if (this.isRunning) {
            console.warn('Emotion detection already running');
            return;
        }

        try {
            this.view.showStatus('Đang khởi động camera...', 'info');

            // Start camera
            const videoElement = this.view.getVideoElement();
            await this.cameraService.start(videoElement);
            
            this.view.showStatus('Đang tải AI models...', 'info');

            // Load models
            await this.emotionService.loadModels();
            
            this.view.showStatus('Đang phát hiện cảm xúc...', 'success');

            // Start detection
            this.emotionService.startDetection(videoElement, (emotion) => {
                this.handleEmotionDetected(emotion);
            }, 1000);

            this.isRunning = true;
            console.log('✅ Emotion detection started');
        } catch (error) {
            console.error('❌ Failed to start emotion detection:', error);
            this.view.showStatus(error.message || 'Không thể khởi động!', 'error');
            throw error;
        }
    }

    /**
     * Dừng detection
     */
    stop() {
        this.emotionService.stopDetection();
        this.cameraService.stop();
        this.view.clearCanvas();
        this.isRunning = false;
        this.view.showStatus('Đã dừng', 'info');
        console.log('⏸️ Emotion detection stopped');
    }

    /**
     * Xử lý khi phát hiện emotion
     */
    handleEmotionDetected(emotion) {
        this.currentEmotion = emotion;
        this.emotionHistory.push(emotion);

        // Update view
        this.view.showEmotion(emotion);

        // Save to API if authenticated
        if (this.apiService && this.apiService.isAuthenticated()) {
            this.saveEmotionToAPI(emotion);
        }

        // Trigger callback
        if (this.onEmotionDetected) {
            this.onEmotionDetected(emotion);
        }
    }

    /**
     * Lưu emotion vào database
     */
    async saveEmotionToAPI(emotion) {
        try {
            await this.apiService.saveEmotion({
                emotion: emotion.emotion,
                confidence: emotion.confidence,
                detections: emotion.detections,
                timestamp: emotion.timestamp
            });
        } catch (error) {
            console.error('Failed to save emotion:', error);
        }
    }

    /**
     * Lấy emotion hiện tại
     */
    getCurrentEmotion() {
        return this.currentEmotion;
    }

    /**
     * Lấy emotion history
     */
    getEmotionHistory() {
        return this.emotionHistory;
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.emotionHistory = [];
    }

    /**
     * Set callback khi detect emotion
     */
    setEmotionCallback(callback) {
        this.onEmotionDetected = callback;
    }
}
