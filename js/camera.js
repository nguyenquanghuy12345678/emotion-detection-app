class CameraHandler {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.stream = null;
    }

    // Check HTTPS requirement for production
    checkHTTPS() {
        const isProduction = window.location.hostname !== 'localhost' && 
                            window.location.hostname !== '127.0.0.1';
        const isHTTPS = window.location.protocol === 'https:';
        
        if (CONFIG.ENABLE_HTTPS_CHECK && isProduction && !isHTTPS) {
            console.warn('⚠️ Camera requires HTTPS in production!');
            alert('⚠️ Cảnh báo: Camera chỉ hoạt động trên HTTPS.\nVui lòng truy cập qua https://');
            return false;
        }
        return true;
    }

    // Start camera with enhanced settings for web deployment
    async startCamera() {
        try {
            // Check HTTPS requirement
            if (!this.checkHTTPS()) {
                return false;
            }

            // Enhanced camera constraints for web deployment
            const constraints = {
                video: {
                    width: { ideal: CONFIG.VIDEO_WIDTH, max: 1920 },
                    height: { ideal: CONFIG.VIDEO_HEIGHT, max: 1080 },
                    facingMode: CONFIG.VIDEO_FACING_MODE, // Front camera (user-facing)
                    aspectRatio: { ideal: 16/9 },
                    frameRate: { ideal: 30, max: 60 }
                },
                audio: false
            };

            if (CONFIG.ENABLE_DEBUG_LOG) {
                console.log('🎥 Requesting camera with constraints:', constraints);
            }
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Log camera info
            const videoTrack = this.stream.getVideoTracks()[0];
            if (CONFIG.ENABLE_DEBUG_LOG) {
                console.log('📹 Camera started:', videoTrack.label);
                console.log('⚙️ Camera settings:', videoTrack.getSettings());
            }
            
            this.video.srcObject = this.stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    if (CONFIG.ENABLE_DEBUG_LOG) {
                        console.log('✅ Video metadata loaded');
                    }
                    resolve(true);
                };
            });
        } catch (error) {
            console.error('❌ Error accessing camera:', error);
            
            // More detailed error messages
            let errorMessage = 'Không thể truy cập camera.\n\n';
            
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage += '🚫 Bạn đã từ chối quyền truy cập camera.\n';
                errorMessage += 'Vui lòng:\n';
                errorMessage += '1. Nhấp vào biểu tượng 🔒 trên thanh địa chỉ\n';
                errorMessage += '2. Cho phép quyền Camera\n';
                errorMessage += '3. Tải lại trang (F5)';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage += '📷 Không tìm thấy camera.\n';
                errorMessage += 'Vui lòng kiểm tra camera đã được kết nối chưa.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage += '⚠️ Camera đang được sử dụng bởi ứng dụng khác.\n';
                errorMessage += 'Vui lòng đóng các ứng dụng khác đang dùng camera.';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage += '⚙️ Cấu hình camera không được hỗ trợ.\n';
                errorMessage += 'Thử với camera khác hoặc giảm độ phân giải.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += '🌐 Trình duyệt không hỗ trợ truy cập camera.\n';
                errorMessage += 'Vui lòng sử dụng Chrome, Edge, hoặc Firefox.';
            } else {
                errorMessage += `Lỗi: ${error.message}`;
            }
            
            alert(errorMessage);
            return false;
        }
    }

    // Stop camera
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.video.srcObject) {
            this.video.srcObject = null;
        }
        
        if (CONFIG.ENABLE_DEBUG_LOG) {
            console.log('🛑 Camera stopped');
        }
    }

    // Switch between front and back camera
    async switchCamera() {
        const currentFacingMode = CONFIG.VIDEO_FACING_MODE;
        CONFIG.VIDEO_FACING_MODE = currentFacingMode === 'user' ? 'environment' : 'user';
        
        this.stopCamera();
        return await this.startCamera();
    }

    // Get available cameras
    async getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            
            if (CONFIG.ENABLE_DEBUG_LOG) {
                console.log('📹 Available cameras:', cameras);
            }
            
            return cameras;
        } catch (error) {
            console.error('Error enumerating devices:', error);
            return [];
        }
    }

    // Get video element
    getVideo() {
        return this.video;
    }

    // Get canvas element
    getCanvas() {
        return this.canvas;
    }

    // Setup canvas dimensions
    setupCanvas() {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        if (CONFIG.ENABLE_DEBUG_LOG) {
            console.log(`🎨 Canvas setup: ${this.canvas.width}x${this.canvas.height}`);
        }
    }
}
