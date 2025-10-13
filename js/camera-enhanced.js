class CameraHandler {
    constructor() {
        this.stream = null;
        this.video = null;
        this.isActive = false;
        this.constraints = {
            video: {
                width: { ideal: CONFIG.VIDEO_WIDTH, max: 1920 },
                height: { ideal: CONFIG.VIDEO_HEIGHT, max: 1080 },
                facingMode: CONFIG.VIDEO_FACING_MODE,
                frameRate: { ideal: 15, max: 30 } // Reduced for better performance
            },
            audio: false
        };
        
        this.initVideoElement();
    }

    // Initialize video element
    initVideoElement() {
        this.video = document.getElementById('video');
        
        if (!this.video) {
            console.error('Video element not found');
            return;
        }

        // Enhanced video element setup
        this.video.playsInline = true;
        this.video.muted = true;
        this.video.autoplay = true;
        
        // Add event listeners for better error handling
        this.video.addEventListener('loadedmetadata', () => {
            console.log('Video metadata loaded:', {
                width: this.video.videoWidth,
                height: this.video.videoHeight,
                duration: this.video.duration
            });
        });
        
        this.video.addEventListener('error', (e) => {
            console.error('Video element error:', e);
            this.handleVideoError(e);
        });
        
        this.video.addEventListener('abort', () => {
            console.warn('Video loading aborted');
        });
    }

    // Enhanced camera start with multiple fallback options
    async startCamera() {
        try {
            console.log('Starting camera with constraints:', this.constraints);
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia not supported in this browser');
            }
            
            // Try different quality levels if high quality fails
            const qualityLevels = [
                // High quality (original)
                this.constraints,
                
                // Medium quality
                {
                    video: {
                        width: { ideal: 640, max: 1280 },
                        height: { ideal: 480, max: 720 },
                        facingMode: CONFIG.VIDEO_FACING_MODE,
                        frameRate: { ideal: 15, max: 24 }
                    },
                    audio: false
                },
                
                // Low quality
                {
                    video: {
                        width: { ideal: 320, max: 640 },
                        height: { ideal: 240, max: 480 },
                        facingMode: CONFIG.VIDEO_FACING_MODE,
                        frameRate: { ideal: 10, max: 15 }
                    },
                    audio: false
                },
                
                // Basic quality (last resort)
                {
                    video: {
                        facingMode: CONFIG.VIDEO_FACING_MODE
                    },
                    audio: false
                },
                
                // Simplest possible
                {
                    video: true,
                    audio: false
                }
            ];
            
            let lastError = null;
            
            for (let i = 0; i < qualityLevels.length; i++) {
                try {
                    console.log(`Trying camera quality level ${i + 1}/${qualityLevels.length}`);
                    
                    this.stream = await navigator.mediaDevices.getUserMedia(qualityLevels[i]);
                    
                    if (this.stream && this.stream.getVideoTracks().length > 0) {
                        console.log(`Camera started successfully with quality level ${i + 1}`);
                        
                        // Log actual video track settings
                        const videoTrack = this.stream.getVideoTracks()[0];
                        const settings = videoTrack.getSettings();
                        console.log('Actual camera settings:', settings);
                        
                        break; // Success!
                    }
                } catch (error) {
                    lastError = error;
                    console.warn(`Quality level ${i + 1} failed:`, error.message);
                    
                    // Don't continue if user denied permission
                    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                        throw error;
                    }
                    
                    continue; // Try next quality level
                }
            }
            
            if (!this.stream) {
                throw lastError || new Error('Failed to start camera with any quality setting');
            }
            
            // Set video source
            this.video.srcObject = this.stream;
            
            // Wait for video to be ready
            await this.waitForVideoReady();
            
            this.isActive = true;
            console.log('Camera started successfully!');
            
            // Add error handling for stream interruption
            this.stream.getVideoTracks().forEach(track => {
                track.addEventListener('ended', () => {
                    console.warn('Camera track ended');
                    this.handleCameraLost();
                });
                
                track.addEventListener('mute', () => {
                    console.warn('Camera track muted');
                });
                
                track.addEventListener('unmute', () => {
                    console.log('Camera track unmuted');
                });
            });
            
            return true;
            
        } catch (error) {
            console.error('Camera start error:', error);
            this.handleCameraError(error);
            return false;
        }
    }

    // Wait for video to be ready
    async waitForVideoReady() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Video ready timeout'));
            }, 10000);
            
            const checkReady = () => {
                if (this.video.readyState >= 2) { // HAVE_CURRENT_DATA
                    clearTimeout(timeout);
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            
            checkReady();
        });
    }

    // Handle camera errors with specific messages
    handleCameraError(error) {
        let userMessage = '';
        
        switch (error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
                userMessage = ERROR_MESSAGES.camera.permission;
                this.showCameraPermissionHelp();
                break;
                
            case 'NotFoundError':
            case 'DevicesNotFoundError':
                userMessage = ERROR_MESSAGES.camera.notFound;
                break;
                
            case 'NotReadableError':
            case 'TrackStartError':
                userMessage = ERROR_MESSAGES.camera.inUse;
                break;
                
            case 'OverconstrainedError':
                userMessage = 'Camera không hỗ trợ cài đặt yêu cầu. Đang thử cài đặt khác...';
                // Auto-retry with lower settings handled in startCamera
                break;
                
            case 'AbortError':
                userMessage = 'Việc truy cập camera bị gián đoạn.';
                break;
                
            case 'SecurityError':
                userMessage = 'Lỗi bảo mật. Vui lòng sử dụng HTTPS hoặc localhost!';
                break;
                
            default:
                userMessage = ERROR_MESSAGES.camera.generic + ` (${error.name || 'Unknown'})`;
        }
        
        // Update UI with error message
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = userMessage;
        }
    }

    // Show camera permission help
    showCameraPermissionHelp() {
        const helpHTML = `
        <div class="camera-help">
            <h4>🎥 Hướng dẫn cấp quyền Camera:</h4>
            <ul>
                <li><strong>Chrome:</strong> Nhấn vào biểu tượng 🔒 bên trái URL → Cho phép Camera</li>
                <li><strong>Firefox:</strong> Nhấn vào biểu tượng camera trong thanh địa chỉ → Cho phép</li>
                <li><strong>Edge:</strong> Cài đặt → Quyền riêng tư → Camera → Cho phép trang web này</li>
                <li><strong>Safari:</strong> Safari → Tùy chọn → Trang web → Camera → Cho phép</li>
            </ul>
            <p>Sau khi cấp quyền, hãy <strong>tải lại trang</strong> và thử lại!</p>
        </div>
        `;
        
        // Add help to status area
        const statusElement = document.getElementById('status');
        if (statusElement && !statusElement.querySelector('.camera-help')) {
            const helpDiv = document.createElement('div');
            helpDiv.innerHTML = helpHTML;
            statusElement.appendChild(helpDiv);
        }
    }

    // Handle camera lost (e.g., unplugged)
    handleCameraLost() {
        console.warn('Camera connection lost');
        
        if (window.emotionApp) {
            window.emotionApp.stop();
            window.emotionApp.updateStatus('Camera bị ngắt kết nối. Vui lòng kiểm tra camera và khởi động lại!', false);
        }
        
        this.isActive = false;
    }

    // Handle video element errors
    handleVideoError(event) {
        const error = event.target.error;
        let message = 'Lỗi video: ';
        
        switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
                message += 'Video bị gián đoạn';
                break;
            case MediaError.MEDIA_ERR_NETWORK:
                message += 'Lỗi mạng khi tải video';
                break;
            case MediaError.MEDIA_ERR_DECODE:
                message += 'Lỗi giải mã video';
                break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                message += 'Định dạng video không được hỗ trợ';
                break;
            default:
                message += 'Lỗi không xác định';
        }
        
        console.error('Video error:', message, error);
    }

    // Stop camera with cleanup
    stopCamera() {
        try {
            if (this.stream) {
                // Stop all tracks
                this.stream.getTracks().forEach(track => {
                    track.stop();
                    console.log('Stopped track:', track.kind);
                });
                
                this.stream = null;
            }
            
            if (this.video) {
                this.video.srcObject = null;
                this.video.load(); // Reset video element
            }
            
            this.isActive = false;
            console.log('Camera stopped successfully');
            
        } catch (error) {
            console.error('Error stopping camera:', error);
        }
    }

    // Get available cameras (for future features)
    async getAvailableCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            
            console.log('Available cameras:', cameras.map(cam => ({
                id: cam.deviceId,
                label: cam.label || 'Camera không tên'
            })));
            
            return cameras;
        } catch (error) {
            console.error('Error getting cameras:', error);
            return [];
        }
    }

    // Switch camera (for future features)
    async switchCamera(deviceId) {
        if (!deviceId) {
            console.error('No device ID provided');
            return false;
        }
        
        try {
            // Stop current camera
            this.stopCamera();
            
            // Update constraints with specific device
            this.constraints.video.deviceId = { exact: deviceId };
            
            // Restart with new camera
            return await this.startCamera();
            
        } catch (error) {
            console.error('Error switching camera:', error);
            
            // Reset constraints and try default camera
            delete this.constraints.video.deviceId;
            return await this.startCamera();
        }
    }

    // Get video element (for detection)
    getVideoElement() {
        return this.video;
    }

    // Check if camera is active
    isRunning() {
        return this.isActive && this.stream && this.video && this.video.readyState >= 2;
    }

    // Get video dimensions
    getVideoDimensions() {
        if (!this.video) {
            return { width: 0, height: 0 };
        }
        
        return {
            width: this.video.videoWidth || this.video.clientWidth,
            height: this.video.videoHeight || this.video.clientHeight
        };
    }

    // Take screenshot (for future features)
    captureFrame() {
        if (!this.isRunning()) {
            console.error('Camera not running');
            return null;
        }
        
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = this.video.videoWidth;
            canvas.height = this.video.videoHeight;
            
            ctx.drawImage(this.video, 0, 0);
            
            return canvas.toDataURL('image/jpeg', 0.8);
        } catch (error) {
            console.error('Error capturing frame:', error);
            return null;
        }
    }
}