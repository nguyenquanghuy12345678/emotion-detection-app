const CONFIG = {
    // Model paths - Always use CDN (works everywhere, no CORS issues)
    MODEL_URL: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/',
    
    // Detection settings
    DETECTION_INTERVAL: 100, // ms
    MIN_CONFIDENCE: 0.5,
    
    // Video settings (720p for better quality on web)
    VIDEO_WIDTH: 1280,
    VIDEO_HEIGHT: 720,
    VIDEO_FACING_MODE: 'user', // 'user' = front camera, 'environment' = back camera
    
    // Animation settings
    EMOJI_SPAWN_RATE: 2000, // ms for surprised emotion
    
    // Emotion thresholds
    EMOTION_THRESHOLD: 0.6,
    
    // Timezone settings
    TIMEZONE: 'Asia/Ho_Chi_Minh', // Vietnam timezone
    TIMEZONE_OFFSET: 7, // GMT+7
    
    // Production settings
    ENABLE_HTTPS_CHECK: true, // Check if running on HTTPS in production
    ENABLE_DEBUG_LOG: false    // Disable console logs in production
};

// Emotion mappings
const EMOTIONS = {
    happy: {
        emoji: '😄',
        label: 'Vui Vẻ',
        message: 'Bạn đang rất vui! Hãy giữ vững tinh thần này nhé! 🌟',
        bgClass: 'happy',
        color: '#FFEB3B'
    },
    sad: {
        emoji: '😢',
        label: 'Buồn',
        message: 'Mọi chuyện rồi sẽ ổn thôi. Hãy mạnh mẽ lên! 💪',
        bgClass: 'sad',
        color: '#607D8B'
    },
    angry: {
        emoji: '😡',
        label: 'Tức Giận',
        message: 'Hãy thở sâu và bình tĩnh nhé. Mọi thứ sẽ tốt hơn! 🌈',
        bgClass: 'angry',
        color: '#E53935'
    },
    surprised: {
        emoji: '😲',
        label: 'Ngạc Nhiên',
        message: 'Wow! Điều gì khiến bạn ngạc nhiên vậy? ✨',
        bgClass: 'surprised',
        color: '#4ECDC4'
    },
    neutral: {
        emoji: '😐',
        label: 'Bình Thường',
        message: 'Mọi thứ có ổn không? Hãy cười lên nào! 😊',
        bgClass: 'neutral',
        color: '#42A5F5'
    },
    fearful: {
        emoji: '😨',
        label: 'Sợ Hãi',
        message: 'Đừng lo lắng, mọi thứ đều ổn. Bạn rất an toàn! 🛡️',
        bgClass: 'fearful',
        color: '#9C27B0'
    },
    disgusted: {
        emoji: '🤢',
        label: 'Ghê Tởm',
        message: 'Có gì đó không ổn sao? Hy vọng bạn sẽ cảm thấy tốt hơn! 🌿',
        bgClass: 'disgusted',
        color: '#8BC34A'
    }
};