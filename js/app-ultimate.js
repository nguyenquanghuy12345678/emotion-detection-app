class EmotionDetectionApp {
    constructor() {
        // Prevent duplicate initialization
        if (window.emotionAppInstance) {
            console.warn('EmotionDetectionApp already exists, returning existing instance');
            return window.emotionAppInstance;
        }
        
        this.cameraHandler = null;
        this.emotionHandler = null;
        this.isRunning = false;
        this.modelsLoaded = false;
        this.detectionInterval = null;
        this.fpsCounter = 0;
        this.lastFpsUpdate = Date.now();
        this.backendType = 'unknown';
        this.initializationAttempts = 0;
        this.maxInitAttempts = 3;
        this.isInitializing = false;
        
        // Store instance globally
        window.emotionAppInstance = this;
        
        // Initialize with delay to ensure DOM is ready
        setTimeout(() => this.init(), 100);
    }

    // Enhanced initialization with comprehensive error handling
    async init() {
        if (this.isInitializing) {
            console.log('Already initializing, skipping...');
            return;
        }
        
        this.isInitializing = true;
        
        try {
            console.log('🚀 Initializing EmotionDetectionApp Ultimate...');
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize AI backend
            await this.initializeAIBackend();
            
            // Load AI models
            await this.loadModels();
            
            console.log('✅ EmotionDetectionApp initialized successfully!');
            window.AIAssistant.initialized = true;
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            await this.handleInitializationError(error);
        } finally {
            this.isInitializing = false;
        }
    }

    // Initialize core components
    async initializeComponents() {
        try {
            // Wait for required classes to be available
            await this.waitForClasses(['CameraHandler', 'EmotionHandler']);
            
            this.cameraHandler = new CameraHandler();
            this.emotionHandler = new EmotionHandler();
            
            console.log('✅ Components initialized');
        } catch (error) {
            console.error('Component initialization error:', error);
            
            // Create fallback handlers if classes not available
            this.cameraHandler = this.createFallbackCameraHandler();
            this.emotionHandler = this.createFallbackEmotionHandler();
        }
    }

    // Wait for required classes to be loaded
    async waitForClasses(classNames, timeout = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const allAvailable = classNames.every(className => 
                typeof window[className] !== 'undefined'
            );
            
            if (allAvailable) {
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error(`Timeout waiting for classes: ${classNames.join(', ')}`);
    }

    // Create fallback camera handler
    createFallbackCameraHandler() {
        return {
            startCamera: async () => {
                console.warn('Using fallback camera handler');
                return false;
            },
            stopCamera: () => {},
            getVideoElement: () => document.getElementById('video'),
            isRunning: () => false
        };
    }

    // Create fallback emotion handler
    createFallbackEmotionHandler() {
        return {
            processDetections: (detections, video) => {
                console.log('Fallback emotion processing');
            }
        };
    }

    // Enhanced AI backend initialization
    async initializeAIBackend() {
        try {
            this.updateStatus('Initializing AI backend...', true);
            
            // Check if Face-API is loaded
            if (typeof faceapi === 'undefined') {
                throw new Error('Face-API library not loaded');
            }
            
            // System capability detection
            const capabilities = await this.detectSystemCapabilities();
            console.log('System capabilities:', capabilities);
            
            // Determine best backend order
            const backendOrder = this.determineBestBackends(capabilities);
            console.log('Backend priority order:', backendOrder);
            
            // Try backends in order
            let backendInitialized = false;
            
            for (const backend of backendOrder) {
                try {
                    console.log(`🔄 Attempting ${backend} backend...`);
                    this.updateStatus(`Trying ${backend.toUpperCase()} backend...`, true);
                    
                    // Set backend with timeout
                    await this.initializeBackendWithTimeout(backend, 10000);
                    
                    this.backendType = backend;
                    window.AIAssistant.backend = backend;
                    backendInitialized = true;
                    
                    console.log(`✅ ${backend} backend initialized successfully!`);
                    this.updateStatus(`AI Backend: ${backend.toUpperCase()} ready`, false);
                    
                    break;
                    
                } catch (error) {
                    console.warn(`❌ ${backend} backend failed:`, error.message);
                    continue;
                }
            }
            
            if (!backendInitialized) {
                throw new Error('All AI backends failed to initialize');
            }
            
            // Validate backend
            await this.validateBackend();
            
        } catch (error) {
            console.error('AI backend initialization error:', error);
            throw error;
        }
    }

    // Detect system capabilities
    async detectSystemCapabilities() {
        const capabilities = {
            webgl: false,
            webgl2: false,
            wasm: false,
            gpu: false,
            memory: 0,
            cores: 0
        };
        
        try {
            // WebGL detection
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            const gl2 = canvas.getContext('webgl2');
            
            capabilities.webgl = !!gl;
            capabilities.webgl2 = !!gl2;
            
            // GPU info
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    capabilities.gpu = true;
                    capabilities.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
            
            // WebAssembly
            capabilities.wasm = typeof WebAssembly === 'object' && 
                                typeof WebAssembly.instantiate === 'function';
            
            // System info
            capabilities.memory = navigator.deviceMemory || 4; // Default 4GB
            capabilities.cores = navigator.hardwareConcurrency || 4; // Default 4 cores
            
        } catch (error) {
            console.warn('Capability detection error:', error);
        }
        
        return capabilities;
    }

    // Determine best backend order based on capabilities
    determineBestBackends(capabilities) {
        const backends = [];
        
        // WebGL backends (fastest)
        if (capabilities.webgl2) {
            backends.push('webgl');
        } else if (capabilities.webgl) {
            backends.push('webgl');
        }
        
        // WASM backend (good compatibility and speed)
        if (capabilities.wasm) {
            backends.push('wasm');
        }
        
        // CPU backend (ultimate fallback)
        backends.push('cpu');
        
        return backends;
    }

    // Initialize backend with timeout
    async initializeBackendWithTimeout(backend, timeout = 10000) {
        const initPromise = this.doBackendInitialization(backend);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Backend ${backend} timeout`)), timeout)
        );
        
        return Promise.race([initPromise, timeoutPromise]);
    }

    // Actual backend initialization
    async doBackendInitialization(backend) {
        try {
            // Set the backend
            await faceapi.tf.setBackend(backend);
            
            // Wait for it to be ready
            await faceapi.tf.ready();
            
            // Test with a simple operation
            await this.testBackend();
            
        } catch (error) {
            // Clean up failed backend
            try {
                await faceapi.tf.removeBackend(backend);
            } catch (cleanupError) {
                console.warn('Backend cleanup error:', cleanupError);
            }
            throw error;
        }
    }

    // Test backend functionality
    async testBackend() {
        try {
            // Create a small tensor to test the backend
            const testTensor = faceapi.tf.tensor2d([[1, 2], [3, 4]]);
            const result = testTensor.sum();
            await result.data(); // Force computation
            
            // Clean up
            testTensor.dispose();
            result.dispose();
            
        } catch (error) {
            throw new Error(`Backend test failed: ${error.message}`);
        }
    }

    // Validate backend is working
    async validateBackend() {
        try {
            const backendName = faceapi.tf.getBackend();
            console.log(`Backend validation: ${backendName}`);
            
            if (!backendName) {
                throw new Error('No backend active');
            }
            
            return true;
        } catch (error) {
            throw new Error(`Backend validation failed: ${error.message}`);
        }
    }

    // Enhanced model loading with multiple CDN support
    async loadModels() {
        try {
            this.updateStatus('Loading AI models...', true);
            
            console.log('🤖 Loading Face-API models...');
            console.log('Backend:', this.backendType);
            
            const modelUrls = [
                CONFIG.MODEL_URL,
                CONFIG.MODEL_URL_BACKUP || 'https://unpkg.com/@vladmandic/face-api@latest/model/',
                'https://cdn.skypack.dev/@vladmandic/face-api/model/'
            ];
            
            let modelsLoaded = false;
            let lastError = null;
            
            for (let i = 0; i < modelUrls.length; i++) {
                try {
                    console.log(`📥 Trying CDN ${i + 1}/${modelUrls.length}: ${modelUrls[i]}`);
                    
                    await this.loadModelsFromUrl(modelUrls[i]);
                    
                    console.log(`✅ Models loaded from CDN ${i + 1}`);
                    modelsLoaded = true;
                    break;
                    
                } catch (error) {
                    console.warn(`❌ CDN ${i + 1} failed:`, error.message);
                    lastError = error;
                    
                    if (i < modelUrls.length - 1) {
                        this.updateStatus(`CDN ${i + 1} failed, trying backup...`, true);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            
            if (!modelsLoaded) {
                throw lastError || new Error('All CDN attempts failed');
            }
            
            // Test model functionality
            await this.testModels();
            
            this.modelsLoaded = true;
            this.updateStatus(`✅ Ready! Backend: ${this.backendType.toUpperCase()}`, false);
            document.getElementById('startBtn').disabled = false;
            
        } catch (error) {
            console.error('❌ Model loading failed:', error);
            await this.handleModelLoadError(error);
        }
    }

    // Load models from specific URL
    async loadModelsFromUrl(baseUrl) {
        const timeout = 30000; // 30 second timeout per model
        
        const loadPromise = Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(baseUrl),
            faceapi.nets.faceExpressionNet.loadFromUri(baseUrl)
        ]);
        
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Model loading timeout')), timeout)
        );
        
        return Promise.race([loadPromise, timeoutPromise]);
    }

    // Test loaded models
    async testModels() {
        try {
            console.log('🧪 Testing model functionality...');
            
            // Create test canvas
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 128;
            testCanvas.height = 128;
            const ctx = testCanvas.getContext('2d');
            
            // Fill with test pattern
            ctx.fillStyle = '#808080';
            ctx.fillRect(0, 0, 128, 128);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(32, 32, 64, 64);
            
            // Run detection test
            const detections = await faceapi
                .detectAllFaces(testCanvas, new faceapi.TinyFaceDetectorOptions({
                    inputSize: 128,
                    scoreThreshold: 0.1
                }))
                .withFaceExpressions();
                
            console.log('✅ Model test completed');
            
        } catch (error) {
            console.warn('⚠️ Model test failed (models may still work):', error.message);
        }
    }

    // Handle initialization errors
    async handleInitializationError(error) {
        this.initializationAttempts++;
        
        let errorMessage = '❌ AI initialization failed: ';
        let canRetry = false;
        
        if (error.message.includes('Face-API')) {
            errorMessage += 'AI library not loaded. Check internet connection.';
        } else if (error.message.includes('backend')) {
            errorMessage += 'AI engine failed. Your device may not support GPU acceleration.';
            canRetry = true;
        } else if (error.message.includes('timeout')) {
            errorMessage += 'Initialization timeout. Slow network connection.';
            canRetry = true;
        } else {
            errorMessage += error.message;
            canRetry = this.initializationAttempts < this.maxInitAttempts;
        }
        
        this.updateStatus(errorMessage, false);
        
        // Show restart button
        this.showRestartButton();
        
        // Show troubleshooting
        document.getElementById('troubleshooting').style.display = 'block';
        
        // Auto retry if possible
        if (canRetry && this.initializationAttempts < this.maxInitAttempts) {
            setTimeout(() => {
                console.log(`🔄 Auto-retry ${this.initializationAttempts}/${this.maxInitAttempts}`);
                this.restart();
            }, 3000);
        }
    }

    // Handle model loading errors
    async handleModelLoadError(error) {
        let errorMsg = '❌ Model loading failed: ';
        let suggestion = '';
        
        if (error.message.includes('timeout')) {
            errorMsg += 'Network timeout.';
            suggestion = '🔧 Try: Reload page, check internet, or use VPN';
        } else if (error.message.includes('fetch') || error.message.includes('404')) {
            errorMsg += 'CDN unavailable.';
            suggestion = '🔧 Try: Different network, VPN, or DNS (8.8.8.8)';
        } else if (error.message.includes('backend')) {
            errorMsg += 'AI engine error.';
            suggestion = '🔧 Try: Different browser, update drivers, or restart device';
        } else {
            errorMsg += 'Unknown error.';
            suggestion = '🔧 Try: Clear cache, restart browser, or use different device';
        }
        
        this.updateStatus(`${errorMsg} ${suggestion}`, false);
        this.showRestartButton();
        document.getElementById('troubleshooting').style.display = 'block';
    }

    // Show restart functionality
    showRestartButton() {
        const restartBtn = document.getElementById('restartEngineBtn');
        if (restartBtn) {
            restartBtn.style.display = 'inline-block';
        }
        
        // Also add to status area if not exists
        const statusElement = document.getElementById('status');
        let existingBtn = statusElement.querySelector('.restart-inline');
        
        if (!existingBtn) {
            const inlineBtn = document.createElement('button');
            inlineBtn.className = 'restart-btn restart-inline';
            inlineBtn.innerHTML = '🔄 Restart AI Engine';
            inlineBtn.style.marginTop = '15px';
            inlineBtn.onclick = () => this.restart();
            
            statusElement.appendChild(inlineBtn);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        try {
            const startBtn = document.getElementById('startBtn');
            const stopBtn = document.getElementById('stopBtn');
            
            if (startBtn) {
                startBtn.addEventListener('click', () => this.start());
            }
            
            if (stopBtn) {
                stopBtn.addEventListener('click', () => this.stop());
            }
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.key === ' ' && e.target.tagName !== 'INPUT') {
                    e.preventDefault();
                    if (this.isRunning) {
                        this.stop();
                    } else {
                        this.start();
                    }
                }
            });
            
        } catch (error) {
            console.error('Event listener setup error:', error);
        }
    }

    // Restart the application
    async restart() {
        try {
            console.log('🔄 Restarting AI Engine...');
            this.updateStatus('Restarting AI engine...', true);
            
            // Stop current operations
            this.stop();
            
            // Reset state
            this.isRunning = false;
            this.modelsLoaded = false;
            this.backendType = 'unknown';
            this.isInitializing = false;
            
            // Hide restart button
            const restartBtn = document.getElementById('restartEngineBtn');
            if (restartBtn) {
                restartBtn.style.display = 'none';
            }
            
            // Remove inline restart button
            const inlineBtn = document.querySelector('.restart-inline');
            if (inlineBtn) {
                inlineBtn.remove();
            }
            
            // Hide troubleshooting
            document.getElementById('troubleshooting').style.display = 'none';
            
            // Disable start button
            document.getElementById('startBtn').disabled = true;
            
            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Reinitialize
            await this.init();
            
        } catch (error) {
            console.error('❌ Restart failed:', error);
            this.updateStatus('Restart failed. Please reload the page (F5).', false);
        }
    }

    // Start detection
    async start() {
        if (!this.modelsLoaded) {
            this.updateStatus('⚠️ AI models not ready. Please wait or restart.', false);
            return;
        }

        if (this.isRunning) {
            console.log('Detection already running');
            return;
        }

        try {
            this.updateStatus('Starting camera...', true);
            
            // Start camera
            const cameraStarted = await this.cameraHandler.startCamera();
            
            if (!cameraStarted) {
                throw new Error('Camera initialization failed');
            }
            
            this.isRunning = true;
            this.updateStatus('🎭 Analyzing emotions...', false);
            
            // Update UI
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            
            // Start detection loop
            this.startDetectionLoop();
            
        } catch (error) {
            console.error('Start error:', error);
            this.handleStartError(error);
        }
    }

    // Handle start errors
    handleStartError(error) {
        let message = '❌ Start failed: ';
        
        if (error.message.includes('camera') || error.message.includes('getUserMedia')) {
            message += 'Camera access denied or unavailable.';
        } else if (error.message.includes('NotAllowedError')) {
            message += 'Camera permission denied. Please allow camera access.';
        } else {
            message += error.message;
        }
        
        this.updateStatus(message, false);
        this.stop();
    }

    // Start detection loop
    startDetectionLoop() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }
        
        this.detectionInterval = setInterval(async () => {
            if (!this.isRunning || !this.modelsLoaded) {
                return;
            }

            try {
                await this.detectEmotions();
                this.updateFPS();
            } catch (error) {
                console.error('Detection error:', error);
                
                // Handle critical errors
                if (error.message.includes('backend') || error.message.includes('context')) {
                    console.error('Critical detection error, restarting...');
                    this.restart();
                }
            }
        }, CONFIG.DETECTION_INTERVAL || 150);
    }

    // Detect emotions
    async detectEmotions() {
        try {
            const video = this.cameraHandler.getVideoElement();
            
            if (!video || video.readyState < 2) {
                return;
            }

            // Run detection with timeout
            const detectionPromise = faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                    inputSize: CONFIG.INPUT_SIZE || 416,
                    scoreThreshold: CONFIG.MIN_CONFIDENCE || 0.4
                }))
                .withFaceExpressions();
                
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Detection timeout')), 5000)
            );
            
            const detections = await Promise.race([detectionPromise, timeoutPromise]);
            
            if (detections && detections.length > 0) {
                this.emotionHandler.processDetections(detections, video);
            }
            
        } catch (error) {
            // Only log critical errors
            if (CONFIG.ENABLE_DEBUG_LOG) {
                console.warn('Detection warning:', error.message);
            }
            
            if (error.message.includes('backend') || error.message.includes('context')) {
                throw error; // Re-throw critical errors
            }
        }
    }

    // Stop detection
    stop() {
        this.isRunning = false;
        
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        if (this.cameraHandler) {
            this.cameraHandler.stopCamera();
        }
        
        // Update UI
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        
        if (this.modelsLoaded) {
            this.updateStatus(`✅ Stopped. Backend: ${this.backendType.toUpperCase()}`, false);
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
        
        statusText.innerHTML = message;
        
        // Handle loader
        let loader = statusElement.querySelector('.loader');
        
        if (showLoader) {
            if (!loader) {
                loader = document.createElement('div');
                loader.className = 'loader';
                loader.style.cssText = `
                    width: 20px; height: 20px; 
                    border: 2px solid #f3f3f3; 
                    border-top: 2px solid #3498db; 
                    border-radius: 50%; 
                    animation: spin 1s linear infinite;
                    display: inline-block;
                    margin-left: 10px;
                `;
                statusElement.appendChild(loader);
            }
        } else {
            if (loader) {
                loader.remove();
            }
        }
    }

    // Update FPS counter
    updateFPS() {
        this.fpsCounter++;
        const now = Date.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            const fps = Math.round(this.fpsCounter * 1000 / (now - this.lastFpsUpdate));
            
            // Update performance monitor
            const fpsElement = document.getElementById('fpsValue');
            if (fpsElement) {
                fpsElement.textContent = fps;
            }
            
            this.fpsCounter = 0;
            this.lastFpsUpdate = now;
        }
    }

    // Get current status
    getStatus() {
        return {
            initialized: window.AIAssistant.initialized,
            modelsLoaded: this.modelsLoaded,
            isRunning: this.isRunning,
            backend: this.backendType,
            cameraActive: this.cameraHandler ? this.cameraHandler.isRunning() : false
        };
    }
}

// Initialize when DOM and Face-API are ready
function initializeEmotionApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEmotionApp);
        return;
    }
    
    // Check if Face-API is loaded
    if (typeof faceapi === 'undefined') {
        console.log('Waiting for Face-API to load...');
        setTimeout(initializeEmotionApp, 500);
        return;
    }
    
    try {
        console.log('🚀 Creating EmotionDetectionApp instance...');
        window.emotionApp = new EmotionDetectionApp();
    } catch (error) {
        console.error('❌ Failed to create EmotionDetectionApp:', error);
        
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.innerHTML = '❌ App initialization failed. Please reload page (F5).';
        }
    }
}

// Start initialization
initializeEmotionApp();

// Global error handlers
window.addEventListener('error', (event) => {
    // Suppress known extension errors
    if (event.message && (
        event.message.includes('ethereum') || 
        event.message.includes('evmAsk') ||
        event.message.includes('Cannot redefine property')
    )) {
        event.preventDefault();
        return false;
    }
    
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});