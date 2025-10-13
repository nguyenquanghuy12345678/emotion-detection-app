class EmotionDetectionApp {
    constructor() {
        this.cameraHandler = new CameraHandler();
        this.emotionHandler = new EmotionHandler();
        this.isRunning = false;
        this.modelsLoaded = false;
        this.detectionInterval = null;
        this.fpsCounter = 0;
        this.lastFpsUpdate = Date.now();
        this.backendType = 'cpu'; // Default to CPU backend
        
        this.init();
    }

    // Initialize application with backend detection
    async init() {
        this.setupEventListeners();
        await this.initializeBackend();
        await this.loadModels();
    }

    // Initialize TensorFlow backend with fallback support
    async initializeBackend() {
        try {
            this.updateStatus('Đang khởi tạo AI engine...', true);
            
            // Check for WebGL support
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            const hasWebGL = !!gl;
            
            console.log('WebGL Support:', hasWebGL);
            
            // Try different backends in order of preference
            const backends = [];
            
            if (hasWebGL) {
                backends.push('webgl');
            }
            
            // Always include CPU as fallback
            backends.push('cpu');
            
            console.log('Available backends:', backends);
            
            let backendInitialized = false;
            
            for (const backend of backends) {
                try {
                    console.log(`Trying backend: ${backend}`);
                    
                    // Set backend
                    await faceapi.tf.setBackend(backend);
                    await faceapi.tf.ready();
                    
                    this.backendType = backend;
                    backendInitialized = true;
                    console.log(`Backend ${backend} initialized successfully!`);
                    break;
                    
                } catch (error) {
                    console.warn(`Backend ${backend} failed:`, error.message);
                    continue;
                }
            }
            
            if (!backendInitialized) {
                throw new Error('Không thể khởi tạo AI backend');
            }
            
            // Display backend info to user
            const backendInfo = this.backendType === 'webgl' ? 
                'GPU (WebGL) - Hiệu suất cao' : 
                'CPU - Tương thích cao';
                
            console.log(`AI Engine: ${backendInfo}`);
            
        } catch (error) {
            console.error('Backend initialization error:', error);
            throw error;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        
        // Add restart button for troubleshooting
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }
    }

    // Load Face-API models with improved error handling
    async loadModels() {
        try {
            this.updateStatus('Đang tải mô hình AI...', true);
            
            console.log('Loading models from:', CONFIG.MODEL_URL);
            console.log('Backend type:', this.backendType);
            
            // Load models with multiple attempts and timeout
            const maxAttempts = 3;
            const timeout = 45000; // 45 seconds
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    console.log(`Model loading attempt ${attempt}/${maxAttempts}`);
                    
                    const loadPromise = Promise.all([
                        faceapi.nets.tinyFaceDetector.loadFromUri(CONFIG.MODEL_URL),
                        faceapi.nets.faceExpressionNet.loadFromUri(CONFIG.MODEL_URL)
                    ]);
                    
                    // Timeout wrapper
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Model loading timeout')), timeout)
                    );
                    
                    await Promise.race([loadPromise, timeoutPromise]);
                    
                    // If we get here, models loaded successfully
                    console.log('Models loaded successfully!');
                    this.modelsLoaded = true;
                    
                    // Test model functionality
                    await this.testModels();
                    
                    this.updateStatus(`Sẵn sàng! AI Engine: ${this.backendType.toUpperCase()}`, false);
                    document.getElementById('startBtn').disabled = false;
                    
                    return; // Success, exit function
                    
                } catch (error) {
                    console.warn(`Attempt ${attempt} failed:`, error.message);
                    
                    if (attempt === maxAttempts) {
                        throw error; // Final attempt failed
                    }
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            
        } catch (error) {
            console.error('Error loading models:', error);
            await this.handleModelLoadError(error);
        }
    }

    // Test model functionality
    async testModels() {
        try {
            console.log('Testing model functionality...');
            
            // Create a small test canvas
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 64;
            testCanvas.height = 64;
            const ctx = testCanvas.getContext('2d');
            
            // Fill with gray color
            ctx.fillStyle = '#808080';
            ctx.fillRect(0, 0, 64, 64);
            
            // Try to run detection on test image
            const detections = await faceapi
                .detectAllFaces(testCanvas, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();
                
            console.log('Model test completed - ready for use');
            
        } catch (error) {
            console.warn('Model test failed:', error);
            // Don't throw error here - models might still work with real images
        }
    }

    // Handle model loading errors with helpful messages
    async handleModelLoadError(error) {
        let errorMsg = 'Lỗi tải mô hình AI. ';
        let suggestion = '';
        
        if (error.message.includes('timeout')) {
            errorMsg += 'Kết nối mạng chậm.';
            suggestion = 'Kiểm tra internet và nhấn F5 để tải lại!';
        } else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('404')) {
            errorMsg += 'Không thể tải từ CDN.';
            suggestion = 'Thử đổi DNS (8.8.8.8) hoặc sử dụng VPN!';
        } else if (error.message.includes('WebGL') || error.message.includes('backend')) {
            errorMsg += 'Lỗi AI engine.';
            suggestion = 'Thử trình duyệt khác (Chrome/Firefox) hoặc cập nhật driver card đồ họa!';
        } else {
            errorMsg += 'Lỗi không xác định.';
            suggestion = 'Thử tải lại trang hoặc xóa cache trình duyệt!';
        }
        
        const fullMessage = `${errorMsg} ${suggestion}`;
        this.updateStatus(fullMessage, false);
        
        // Show restart button
        this.showRestartButton();
    }

    // Show restart button for troubleshooting
    showRestartButton() {
        const statusElement = document.getElementById('status');
        
        // Remove existing restart button
        const existingBtn = document.getElementById('restartBtn');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        // Create restart button
        const restartBtn = document.createElement('button');
        restartBtn.id = 'restartBtn';
        restartBtn.className = 'btn btn-warning';
        restartBtn.innerHTML = '🔄 Khởi Động Lại';
        restartBtn.style.marginTop = '10px';
        restartBtn.onclick = () => this.restart();
        
        statusElement.appendChild(restartBtn);
    }

    // Restart application
    async restart() {
        try {
            this.updateStatus('Đang khởi động lại...', true);
            
            // Reset state
            this.stop();
            this.modelsLoaded = false;
            document.getElementById('startBtn').disabled = true;
            
            // Remove restart button
            const restartBtn = document.getElementById('restartBtn');
            if (restartBtn) {
                restartBtn.remove();
            }
            
            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Reinitialize
            await this.initializeBackend();
            await this.loadModels();
            
        } catch (error) {
            console.error('Restart failed:', error);
            this.updateStatus('Khởi động lại thất bại. Vui lòng tải lại trang!', false);
        }
    }

    // Update status message
    updateStatus(message, showLoader) {
        const statusElement = document.getElementById('status');
        const statusText = document.getElementById('statusText');
        
        if (!statusText) {
            console.error('Status text element not found');
            return;
        }
        
        statusText.textContent = message;
        
        // Handle loader
        let loader = statusElement.querySelector('.loader');
        
        if (showLoader) {
            if (!loader) {
                loader = document.createElement('div');
                loader.className = 'loader';
                statusElement.appendChild(loader);
            }
        } else {
            if (loader) {
                loader.remove();
            }
        }
    }

    // Start detection with improved error handling
    async start() {
        if (!this.modelsLoaded) {
            alert('Mô hình AI chưa được tải. Vui lòng đợi hoặc nhấn "Khởi Động Lại"!');
            return;
        }

        try {
            this.updateStatus('Đang khởi động camera...', true);
            
            // Start camera with error handling
            const success = await this.cameraHandler.startCamera();
            
            if (!success) {
                throw new Error('Không thể truy cập camera');
            }
            
            this.isRunning = true;
            this.updateStatus('Đang phân tích cảm xúc...', false);
            
            // Update UI
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            
            // Start detection loop
            this.startDetectionLoop();
            
        } catch (error) {
            console.error('Start error:', error);
            
            let errorMsg = 'Lỗi khởi động: ';
            if (error.message.includes('camera') || error.message.includes('getUserMedia')) {
                errorMsg += 'Không thể truy cập camera. Kiểm tra quyền truy cập!';
            } else {
                errorMsg += error.message;
            }
            
            this.updateStatus(errorMsg, false);
            this.stop();
        }
    }

    // Enhanced detection loop
    startDetectionLoop() {
        this.detectionInterval = setInterval(async () => {
            if (!this.isRunning || !this.modelsLoaded) {
                return;
            }

            try {
                await this.detectEmotions();
                this.updateFPS();
            } catch (error) {
                console.error('Detection error:', error);
                
                // Handle specific errors
                if (error.message.includes('backend') || error.message.includes('WebGL')) {
                    this.updateStatus('Lỗi AI engine. Đang khởi động lại...', true);
                    await this.restart();
                }
            }
        }, CONFIG.DETECTION_INTERVAL);
    }

    // Stop detection
    stop() {
        this.isRunning = false;
        
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        this.cameraHandler.stopCamera();
        
        // Update UI
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        
        if (this.modelsLoaded) {
            this.updateStatus(`Đã dừng. AI Engine: ${this.backendType.toUpperCase()}`, false);
        }
    }

    // Detect emotions with enhanced error handling
    async detectEmotions() {
        try {
            const video = this.cameraHandler.getVideoElement();
            if (!video || video.readyState !== 4) {
                return;
            }

            // Run detection with timeout
            const detectionPromise = faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                    inputSize: 416,
                    scoreThreshold: CONFIG.MIN_CONFIDENCE
                }))
                .withFaceExpressions();
                
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Detection timeout')), 5000)
            );
            
            const detections = await Promise.race([detectionPromise, timeoutPromise]);
            
            // Process results
            if (detections && detections.length > 0) {
                this.emotionHandler.processDetections(detections, video);
            }
            
        } catch (error) {
            // Log but don't stop the app for minor errors
            if (CONFIG.ENABLE_DEBUG_LOG) {
                console.warn('Detection warning:', error.message);
            }
            
            // Only restart for critical errors
            if (error.message.includes('backend') || error.message.includes('context')) {
                throw error;
            }
        }
    }

    // Update FPS counter
    updateFPS() {
        this.fpsCounter++;
        const now = Date.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            const fps = Math.round(this.fpsCounter * 1000 / (now - this.lastFpsUpdate));
            
            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                fpsElement.textContent = `${fps} FPS | ${this.backendType.toUpperCase()}`;
            }
            
            this.fpsCounter = 0;
            this.lastFpsUpdate = now;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.emotionApp = new EmotionDetectionApp();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        
        // Show fallback error message
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = 'Lỗi khởi tạo ứng dụng. Vui lòng tải lại trang!';
        }
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});