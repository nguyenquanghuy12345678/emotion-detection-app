/**
 * App.js - Main Application Entry Point
 * Khởi tạo và kết nối tất cả controllers
 */
import { AuthController } from './controllers/AuthController.js';
import { EmotionController } from './controllers/EmotionController.js';
import { ProductivityController } from './controllers/ProductivityController.js';
import { APIService } from './services/APIService.js';

class App {
    constructor() {
        this.apiService = new APIService();
        this.authController = null;
        this.emotionController = null;
        this.productivityController = null;
        
        console.log('🚀 Initializing Emotion Detection App...');
    }

    /**
     * Khởi động ứng dụng
     */
    async init() {
        try {
            // Initialize controllers
            this.authController = new AuthController();
            this.emotionController = new EmotionController(this.apiService);
            this.productivityController = new ProductivityController(this.apiService);

            // Connect emotion detection to productivity tracking
            this.emotionController.setEmotionCallback((emotion) => {
                this.productivityController.updateStatsFromEmotion(emotion);
            });

            // Setup tab navigation
            this.setupTabNavigation();

            // Auto-start camera on camera tab
            const cameraTab = document.getElementById('cameraTab');
            if (cameraTab) {
                cameraTab.addEventListener('click', () => {
                    setTimeout(() => {
                        this.emotionController.start().catch(console.error);
                    }, 100);
                });
            }

            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
        }
    }

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        const tabs = document.querySelectorAll('.tab-button');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                // Remove active from all
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                // Add active to clicked
                tab.classList.add('active');
                const targetContent = document.getElementById(target);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                console.log('📑 Switched to tab:', target);
            });
        });
    }

    /**
     * Get controllers (for debugging)
     */
    getControllers() {
        return {
            auth: this.authController,
            emotion: this.emotionController,
            productivity: this.productivityController
        };
    }
}

// Auto-initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});

export default App;
