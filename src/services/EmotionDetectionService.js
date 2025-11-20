/**
 * EmotionDetectionService - Face-API.js wrapper
 */
import { Emotion } from '../models/Emotion.js';

export class EmotionDetectionService {
    constructor() {
        this.modelsLoaded = false;
        this.isDetecting = false;
    }

    /**
     * Load Face-API models
     */
    async loadModels() {
        if (this.modelsLoaded) return true;

        try {
            console.log('🤖 Loading Face-API models...');
            
            if (typeof faceapi === 'undefined') {
                throw new Error('Face-API not loaded');
            }

            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
                faceapi.nets.faceExpressionNet.loadFromUri('./models')
            ]);

            this.modelsLoaded = true;
            console.log('✅ Face-API models loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Error loading models:', error);
            throw error;
        }
    }

    /**
     * Detect emotion từ video element
     */
    async detect(videoElement) {
        if (!this.modelsLoaded) {
            throw new Error('Models not loaded');
        }

        try {
            const detection = await faceapi
                .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            if (!detection) {
                return null;
            }

            // Tìm emotion có confidence cao nhất
            const expressions = detection.expressions;
            let maxEmotion = 'neutral';
            let maxConfidence = 0;

            Object.entries(expressions).forEach(([emotion, confidence]) => {
                if (confidence > maxConfidence) {
                    maxConfidence = confidence;
                    maxEmotion = emotion;
                }
            });

            return new Emotion({
                emotion: maxEmotion,
                confidence: maxConfidence,
                detections: expressions,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Detection error:', error);
            return null;
        }
    }

    /**
     * Start continuous detection
     */
    startDetection(videoElement, callback, interval = 1000) {
        if (this.isDetecting) {
            console.warn('Detection already running');
            return;
        }

        this.isDetecting = true;
        
        const detectLoop = async () => {
            if (!this.isDetecting) return;

            try {
                const emotion = await this.detect(videoElement);
                if (emotion && callback) {
                    callback(emotion);
                }
            } catch (error) {
                console.error('Detection loop error:', error);
            }

            if (this.isDetecting) {
                setTimeout(detectLoop, interval);
            }
        };

        detectLoop();
        console.log('🔄 Started continuous emotion detection');
    }

    /**
     * Stop continuous detection
     */
    stopDetection() {
        this.isDetecting = false;
        console.log('⏸️ Stopped emotion detection');
    }
}
