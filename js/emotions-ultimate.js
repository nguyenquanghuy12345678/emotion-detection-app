class EmotionHandler {
    constructor() {
        this.currentEmotion = 'neutral';
        this.emotionHistory = [];
        this.confidenceThreshold = CONFIG?.EMOTION_THRESHOLD || 0.5;
        
        console.log('✅ EmotionHandler initialized');
    }

    processDetections(detections, video) {
        try {
            if (!detections || detections.length === 0) {
                this.updateEmotionDisplay('neutral', 0, 'Không phát hiện khuôn mặt');
                return;
            }

            // Get the first (best) detection
            const detection = detections[0];
            const expressions = detection.expressions;

            if (!expressions) {
                this.updateEmotionDisplay('neutral', 0, 'Không thể phân tích cảm xúc');
                return;
            }

            // Find dominant emotion
            const dominantEmotion = this.getDominantEmotion(expressions);
            const confidence = expressions[dominantEmotion];

            if (confidence > this.confidenceThreshold) {
                this.currentEmotion = dominantEmotion;
                this.addToHistory(dominantEmotion, confidence);
                this.updateEmotionDisplay(dominantEmotion, confidence);
                this.updateBackgroundTheme(dominantEmotion);
            }

        } catch (error) {
            console.error('Emotion processing error:', error);
        }
    }

    getDominantEmotion(expressions) {
        let maxConfidence = 0;
        let dominantEmotion = 'neutral';

        Object.entries(expressions).forEach(([emotion, confidence]) => {
            if (confidence > maxConfidence) {
                maxConfidence = confidence;
                dominantEmotion = emotion;
            }
        });

        return dominantEmotion;
    }

    addToHistory(emotion, confidence) {
        this.emotionHistory.push({
            emotion,
            confidence,
            timestamp: Date.now()
        });

        // Keep only last 100 entries
        if (this.emotionHistory.length > 100) {
            this.emotionHistory.shift();
        }
    }

    updateEmotionDisplay(emotion, confidence, message = null) {
        try {
            const emotionConfig = EMOTIONS[emotion] || EMOTIONS.neutral;
            
            // Update emoji
            const emojiEl = document.getElementById('emotionEmoji');
            if (emojiEl) {
                emojiEl.textContent = emotionConfig.emoji;
            }

            // Update label
            const labelEl = document.getElementById('emotionLabel');
            if (labelEl) {
                labelEl.textContent = emotionConfig.label;
            }

            // Update confidence
            const confidenceEl = document.getElementById('emotionConfidence');
            if (confidenceEl && confidence > 0) {
                confidenceEl.textContent = `Confidence: ${Math.round(confidence * 100)}%`;
                confidenceEl.style.display = 'block';
            } else if (confidenceEl) {
                confidenceEl.style.display = 'none';
            }

            // Update message
            const messageEl = document.getElementById('emotionMessage');
            if (messageEl) {
                messageEl.textContent = message || emotionConfig.message;
            }

            // Update productivity suggestion
            this.updateProductivitySuggestion(emotion);

        } catch (error) {
            console.error('Display update error:', error);
        }
    }

    updateProductivitySuggestion(emotion) {
        try {
            const suggestionEl = document.getElementById('productivitySuggestion');
            if (!suggestionEl) return;

            const emotionConfig = EMOTIONS[emotion];
            if (emotionConfig && emotionConfig.productivity) {
                suggestionEl.innerHTML = `
                    <div class="productivity-tip">
                        💡 <strong>Đề xuất:</strong> ${emotionConfig.productivity.suggestion}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Productivity suggestion error:', error);
        }
    }

    updateBackgroundTheme(emotion) {
        try {
            // Remove all emotion classes
            document.body.classList.remove('happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral');
            
            // Add current emotion class
            if (EMOTIONS[emotion]) {
                document.body.classList.add(emotion);
            }
        } catch (error) {
            console.error('Background theme error:', error);
        }
    }

    getEmotionStats() {
        if (this.emotionHistory.length === 0) {
            return {};
        }

        const stats = {};
        const total = this.emotionHistory.length;

        // Count occurrences
        this.emotionHistory.forEach(entry => {
            stats[entry.emotion] = (stats[entry.emotion] || 0) + 1;
        });

        // Convert to percentages
        Object.keys(stats).forEach(emotion => {
            stats[emotion] = Math.round((stats[emotion] / total) * 100);
        });

        return stats;
    }

    getCurrentEmotion() {
        return this.currentEmotion;
    }

    getEmotionHistory() {
        return this.emotionHistory.slice(); // Return copy
    }

    clearHistory() {
        this.emotionHistory = [];
        console.log('Emotion history cleared');
    }
}