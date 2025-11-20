/**
 * Main App Initializer
 * Entry point cho toàn bộ ứng dụng
 */

import { AuthUI } from './modules/auth-ui.js';

class EmotionApp {
    constructor() {
        this.authUI = null;
        this.apiClient = null;
        console.log('🚀 Emotion Detection App Initializing...');
    }

    async init() {
        try {
            // Wait for API client to be ready
            await this.waitForAPIClient();
            
            // Initialize Authentication UI
            this.authUI = new AuthUI(this.apiClient);
            
            // Initialize other modules
            this.initializeModules();
            
            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
        }
    }

    waitForAPIClient() {
        return new Promise((resolve) => {
            if (window.apiClient) {
                this.apiClient = window.apiClient;
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.apiClient) {
                        this.apiClient = window.apiClient;
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    console.warn('⚠️ API Client not found, continuing without it');
                    resolve();
                }, 5000);
            }
        });
    }

    initializeModules() {
        // Productivity tracker will be initialized here
        if (window.productivityTracker) {
            console.log('✅ Productivity tracker loaded');
        }
        
        // Camera and detection will be initialized here
        if (window.camera) {
            console.log('✅ Camera module loaded');
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.emotionApp = new EmotionApp();
    window.emotionApp.init();
});

export default EmotionApp;
