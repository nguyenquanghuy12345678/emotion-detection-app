class EmotionDetectionApp {
    constructor() {
        this.cameraHandler = new CameraHandler();
        this.emotionHandler = new EmotionHandler();
        this.isRunning = false;
        this.modelsLoaded = false;
        this.detectionInterval = null;
        this.fpsCounter = 0;
        this.lastFpsUpdate = Date.now();
        
        this.init();
    }

    // Initialize application
    async init() {
        this.setupEventListeners();
        await this.loadModels();
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
    }

    // Load Face-API models
    async loadModels() {
        try {
            this.updateStatus('Đang tải mô hình AI...', true);
            
            // CRITICAL FIX: Wait for TensorFlow backend to initialize first
            console.log('Initializing TensorFlow backend...');
            await faceapi.tf.ready();
            console.log('TensorFlow backend ready!');
            
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(CONFIG.MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(CONFIG.MODEL_URL)
            ]);
            
            this.modelsLoaded = true;
            this.updateStatus('Sẵn sàng! Nhấn "Bắt Đầu" để bắt đầu.', false);
            document.getElementById('startBtn').disabled = false;
            
        } catch (error) {
            console.error('Error loading models:', error);
            this.updateStatus('Lỗi tải mô hình AI. Vui lòng tải lại trang!', false);
        }
    }

    // Update status message
    updateStatus(message, showLoader) {
        const statusElement = document.getElementById('status');
        const statusText = document.getElementById('statusText');
        const loader = statusElement.querySelector('.loader');
        
        statusText.textContent = message;
        
        if (showLoader) {
            if (!loader) {
                const newLoader = document.createElement('div');
                newLoader.className = 'loader';
                statusElement.appendChild(newLoader);
            }
        } else {
            if (loader) {
                loader.remove();
            }
        }
    }

    // Start detection
    async start() {
        if (!this.modelsLoaded) {
            alert('Mô hình AI chưa được tải. Vui lòng đợi!');
            return;
        }

        this.updateStatus('Đang khởi động camera...', true);
        
        const cameraStarted = await this.cameraHandler.startCamera();
        
        if (!cameraStarted) {
            this.updateStatus('Không thể khởi động camera!', false);
            return;
        }

        this.cameraHandler.setupCanvas();
        
        this.isRunning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        this.updateStatus('Đang nhận diện cảm xúc...', false);
        
        this.startDetectionLoop();
        this.startFpsCounter();
    }

    // Stop detection
    stop() {
        this.isRunning = false;
        
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        this.cameraHandler.stopCamera();
        this.emotionHandler.reset();
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('fps').textContent = '0';
        
        this.updateStatus('Đã dừng. Nhấn "Bắt Đầu" để tiếp tục.', false);
    }

    // Start detection loop
    startDetectionLoop() {
        this.detectionInterval = setInterval(async () => {
            await this.detectEmotions();
        }, CONFIG.DETECTION_INTERVAL);
    }

    // Detect emotions
    async detectEmotions() {
        if (!this.isRunning) return;

        const video = this.cameraHandler.getVideo();
        const canvas = this.cameraHandler.getCanvas();
        
        try {
            const detections = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            // Clear canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detections) {
                // Draw face detection box
                const resizedDetections = faceapi.resizeResults(detections, {
                    width: canvas.width,
                    height: canvas.height
                });
                
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

                // Get dominant emotion
                const expressions = detections.expressions;
                const dominantEmotion = this.getDominantEmotion(expressions);
                
                if (dominantEmotion) {
                    const confidence = expressions[dominantEmotion];
                    
                    if (confidence > CONFIG.MIN_CONFIDENCE) {
                        this.emotionHandler.updateEmotionDisplay(dominantEmotion, confidence);
                    }
                }

                // Update FPS counter
                this.fpsCounter++;
            } else {
                // No face detected
                this.emotionHandler.updateEmotionDisplay('neutral', 0);
            }

        } catch (error) {
            console.error('Detection error:', error);
        }
    }

    // Get dominant emotion from expressions
    getDominantEmotion(expressions) {
        let maxValue = 0;
        let dominantEmotion = null;

        for (const [emotion, value] of Object.entries(expressions)) {
            if (value > maxValue) {
                maxValue = value;
                dominantEmotion = emotion;
            }
        }

        return dominantEmotion;
    }

    // Start FPS counter
    startFpsCounter() {
        setInterval(() => {
            const now = Date.now();
            const elapsed = (now - this.lastFpsUpdate) / 1000;
            const fps = Math.round(this.fpsCounter / elapsed);
            
            document.getElementById('fps').textContent = fps;
            
            this.fpsCounter = 0;
            this.lastFpsUpdate = now;
        }, 1000);
    }
}

// ============================================
// START APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new EmotionDetectionApp();
});