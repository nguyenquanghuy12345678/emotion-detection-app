class EmotionHandler {
    constructor() {
        this.currentEmotion = null;
        this.audioPlaying = null;
        this.emojiInterval = null;
    }

    // Update emotion display
    updateEmotionDisplay(emotion, confidence) {
        const emotionData = EMOTIONS[emotion];
        
        if (!emotionData) return;

        // Update DOM elements
        document.getElementById('emotionEmoji').textContent = emotionData.emoji;
        document.getElementById('emotionText').textContent = emotionData.label;
        document.getElementById('emotionMessage').textContent = emotionData.message;
        
        // Update confidence
        document.getElementById('confidence').textContent = `${Math.round(confidence * 100)}%`;

        // Change background
        this.changeBackground(emotionData.bgClass);

        // Trigger emotion-specific reactions
        this.triggerReaction(emotion);

        this.currentEmotion = emotion;
    }

    // Change background based on emotion
    changeBackground(bgClass) {
        document.body.className = bgClass;
    }

    // Trigger specific reactions for each emotion
    triggerReaction(emotion) {
        // Stop previous reactions
        this.stopAllReactions();

        switch(emotion) {
            case 'happy':
                this.playHappyMusic();
                break;
            case 'sad':
                this.showComfortMessage();
                break;
            case 'angry':
                this.playCalmMusic();
                this.showCalmingMessage();
                break;
            case 'surprised':
                this.startEmojiRain();
                break;
            case 'neutral':
                // Do nothing special
                break;
            case 'fearful':
                this.showReassurance();
                break;
            case 'disgusted':
                this.showSupportMessage();
                break;
        }
    }

    // Play happy background music
    playHappyMusic() {
        const audio = document.getElementById('happySound');
        if (audio && this.audioPlaying !== 'happy') {
            this.stopAllAudio();
            // Create simple happy tone using Web Audio API
            this.playTone(523.25, 0.3); // C5 note
            this.audioPlaying = 'happy';
        }
    }

    // Play calming music
    playCalmMusic() {
        const audio = document.getElementById('calmSound');
        if (audio && this.audioPlaying !== 'calm') {
            this.stopAllAudio();
            this.playTone(261.63, 0.2); // C4 note (calmer)
            this.audioPlaying = 'calm';
        }
    }

    // Simple tone generator using Web Audio API
    playTone(frequency, volume) {
        if (!window.audioContext) {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = window.audioContext.createOscillator();
        const gainNode = window.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(window.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, window.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 1);
        
        oscillator.start(window.audioContext.currentTime);
        oscillator.stop(window.audioContext.currentTime + 1);
    }

    // Stop all audio
    stopAllAudio() {
        ['happySound', 'sadSound', 'calmSound'].forEach(id => {
            const audio = document.getElementById(id);
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        this.audioPlaying = null;
    }

    // Show comfort message for sad emotion
    showComfortMessage() {
        this.createFloatingText('💙 Bạn không đơn độc đâu!');
    }

    // Show calming message for angry emotion
    showCalmingMessage() {
        this.createFloatingText('🧘 Hít thở sâu... 1... 2... 3...');
    }

    // Show reassurance for fearful emotion
    showReassurance() {
        this.createFloatingText('🛡️ Mọi thứ đều ổn!');
    }

    // Show support message for disgusted emotion
    showSupportMessage() {
        this.createFloatingText('🌈 Mọi chuyện sẽ tốt hơn!');
    }

    // Create floating text
    createFloatingText(text) {
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2em;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 9999;
            animation: fadeIn 0.5s ease;
            pointer-events: none;
        `;
        document.body.appendChild(floatingText);
        
        setTimeout(() => {
            floatingText.remove();
        }, 3000);
    }

    // Start emoji rain for surprised emotion
    startEmojiRain() {
        if (this.emojiInterval) return;
        
        this.emojiInterval = setInterval(() => {
            this.createFloatingEmoji(EMOTIONS.surprised.emoji);
        }, CONFIG.EMOJI_SPAWN_RATE / 3);
    }

    // Create floating emoji
    createFloatingEmoji(emoji) {
        const floatingEmoji = document.createElement('div');
        floatingEmoji.className = 'floating-emoji';
        floatingEmoji.textContent = emoji;
        floatingEmoji.style.left = Math.random() * window.innerWidth + 'px';
        floatingEmoji.style.top = window.innerHeight + 'px';
        
        document.body.appendChild(floatingEmoji);
        
        setTimeout(() => {
            floatingEmoji.remove();
        }, 3000);
    }

    // Stop all reactions
    stopAllReactions() {
        this.stopAllAudio();
        
        if (this.emojiInterval) {
            clearInterval(this.emojiInterval);
            this.emojiInterval = null;
        }

        // Remove all floating elements
        document.querySelectorAll('.floating-emoji').forEach(el => el.remove());
    }

    // Reset to default state
    reset() {
        this.stopAllReactions();
        document.body.className = '';
        document.getElementById('emotionEmoji').textContent = '🤖';
        document.getElementById('emotionText').textContent = 'Đang chờ...';
        document.getElementById('emotionMessage').textContent = 'Nhấn "Bắt Đầu" để nhận diện cảm xúc';
        document.getElementById('confidence').textContent = '0%';
        this.currentEmotion = null;
    }
}