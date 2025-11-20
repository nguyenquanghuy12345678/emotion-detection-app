/**
 * CameraService - Quản lý camera và video stream
 */
export class CameraService {
    constructor() {
        this.stream = null;
        this.videoElement = null;
    }

    /**
     * Khởi động camera
     */
    async start(videoElement) {
        this.videoElement = videoElement;

        try {
            console.log('📹 Requesting camera access...');
            
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            this.videoElement.srcObject = this.stream;
            
            // Wait for video to load
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve();
                };
            });

            console.log('✅ Camera started successfully');
            return true;
        } catch (error) {
            console.error('❌ Camera error:', error);
            throw new Error('Không thể truy cập camera. Vui lòng cho phép truy cập camera.');
        }
    }

    /**
     * Dừng camera
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            console.log('📹 Camera stopped');
        }
    }

    /**
     * Kiểm tra camera đang chạy
     */
    isRunning() {
        return this.stream !== null;
    }

    /**
     * Chụp ảnh từ video
     */
    captureFrame() {
        if (!this.videoElement) return null;

        const canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.videoElement, 0, 0);
        
        return canvas.toDataURL('image/jpeg');
    }
}
