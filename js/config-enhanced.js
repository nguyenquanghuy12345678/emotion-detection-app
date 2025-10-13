const CONFIG = {
    // Model paths - Multiple CDN options for better reliability
    MODEL_URL: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/',
    MODEL_URL_BACKUP: 'https://unpkg.com/@vladmandic/face-api@latest/model/',
    MODEL_URL_LOCAL: './models/', // Local fallback if available
    
    // Detection settings - Optimized for stability
    DETECTION_INTERVAL: 150, // Increased for stability
    MIN_CONFIDENCE: 0.4, // Lowered for better detection
    
    // Video settings - Reduced for better performance
    VIDEO_WIDTH: 640, // Reduced from 1280
    VIDEO_HEIGHT: 480, // Reduced from 720
    VIDEO_FACING_MODE: 'user',
    
    // Performance settings
    INPUT_SIZE: 320, // Smaller input size for better performance
    SCORE_THRESHOLD: 0.3,
    
    // Animation settings
    EMOJI_SPAWN_RATE: 2000,
    
    // Emotion thresholds
    EMOTION_THRESHOLD: 0.5, // Lowered for better sensitivity
    
    // System settings
    ENABLE_HTTPS_CHECK: false, // Disabled for local development
    ENABLE_DEBUG_LOG: true, // Enabled for troubleshooting
    
    // Error handling
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000,
    DETECTION_TIMEOUT: 5000,
    
    // Backend preferences
    PREFERRED_BACKEND: ['webgl', 'cpu'], // Fallback order
    FORCE_CPU: false, // Set to true to force CPU backend
    
    // Memory management
    MEMORY_CLEANUP_INTERVAL: 30000, // 30 seconds
    MAX_DETECTION_FAILURES: 5
};

// Enhanced emotion mappings with productivity features
const EMOTIONS = {
    happy: {
        emoji: '😄',
        label: 'Vui Vẻ',
        message: 'Bạn đang rất vui! Hãy giữ vững tinh thần này nhé! 🌟',
        bgClass: 'happy',
        color: '#FFEB3B',
        productivity: {
            status: 'high',
            suggestion: 'Thời điểm tuyệt vời để làm việc sáng tạo!',
            tasks: ['brainstorming', 'creative-work', 'presentation']
        }
    },
    sad: {
        emoji: '😢',
        label: 'Buồn',
        message: 'Mọi chuyện rồi sẽ ổn thôi. Hãy mạnh mẽ lên! 💪',
        bgClass: 'sad',
        color: '#607D8B',
        productivity: {
            status: 'low',
            suggestion: 'Hãy nghỉ ngơi hoặc làm công việc nhẹ nhàng',
            tasks: ['break', 'light-tasks', 'meditation']
        }
    },
    angry: {
        emoji: '😡',
        label: 'Tức Giận',
        message: 'Hãy thở sâu và bình tĩnh nhé. Mọi thứ sẽ tốt hơn! 🌈',
        bgClass: 'angry',
        color: '#E53935',
        productivity: {
            status: 'medium',
            suggestion: 'Thời gian tốt cho công việc cần tập trung cao',
            tasks: ['focus-work', 'problem-solving', 'exercise']
        }
    },
    surprised: {
        emoji: '😲',
        label: 'Ngạc Nhiên',
        message: 'Wow! Có điều gì thú vị đang xảy ra! ✨',
        bgClass: 'surprised',
        color: '#FF9800',
        productivity: {
            status: 'medium',
            suggestion: 'Tập trung để xử lý thông tin mới',
            tasks: ['learning', 'analysis', 'research']
        }
    },
    fearful: {
        emoji: '😨',
        label: 'Lo Lắng',
        message: 'Đừng lo! Mọi thứ sẽ ổn. Hãy tự tin lên! 💪',
        bgClass: 'fearful',
        color: '#9C27B0',
        productivity: {
            status: 'low',
            suggestion: 'Nên nghỉ ngơi và thư giãn',
            tasks: ['relaxation', 'breathing', 'break']
        }
    },
    disgusted: {
        emoji: '🤢',
        label: 'Chán Nản',
        message: 'Hãy làm điều gì đó thú vị để thay đổi tâm trạng! 🎨',
        bgClass: 'disgusted',
        color: '#4CAF50',
        productivity: {
            status: 'low',
            suggestion: 'Thay đổi môi trường hoặc công việc',
            tasks: ['break', 'change-task', 'walk']
        }
    },
    neutral: {
        emoji: '😐',
        label: 'Bình Thường',
        message: 'Bạn đang rất tỉnh táo! Thời gian tuyệt vời để làm việc! 👍',
        bgClass: 'neutral',
        color: '#9E9E9E',
        productivity: {
            status: 'high',
            suggestion: 'Trạng thái lý tưởng để làm việc',
            tasks: ['focused-work', 'planning', 'routine-tasks']
        }
    }
};

// Productivity recommendations based on emotion patterns
const PRODUCTIVITY_RECOMMENDATIONS = {
    morning: {
        happy: 'Sáng vui vẻ - thời gian hoàn hảo cho công việc quan trọng!',
        neutral: 'Sáng tỉnh táo - hãy lập kế hoạch cho ngày mới!',
        sad: 'Sáng buồn - hãy bắt đầu với việc đơn giản nhé!'
    },
    afternoon: {
        happy: 'Chiều vui - tiếp tục momentum tích cực!',
        neutral: 'Chiều ổn định - tập trung hoàn thành task!',
        angry: 'Chiều căng thẳng - hãy nghỉ ngơi 15 phút!'
    },
    evening: {
        happy: 'Tối vui vẻ - thời gian tốt để review và lên kế hoạch!',
        neutral: 'Tối bình thường - chuẩn bị cho ngày mai!',
        sad: 'Tối buồn - hãy thư giãn và self-care nhé!'
    }
};

// AI Assistant personality and responses
const AI_PERSONALITY = {
    name: 'AI Assistant Pro',
    greeting: 'Xin chào! Tôi là AI Assistant Pro - trợ lý thông minh của bạn! 🤖',
    
    capabilities: [
        '🎭 Phân tích cảm xúc real-time',
        '📊 Thống kê năng suất làm việc', 
        '⏰ Quản lý thời gian Pomodoro',
        '💡 Đề xuất tối ưu hóa công việc',
        '🎯 Theo dõi mục tiêu cá nhân',
        '📈 Báo cáo tiến độ chi tiết',
        '🧘 Hướng dẫn thư giãn & meditation',
        '🎨 Tùy chỉnh giao diện theo tâm trạng'
    ],
    
    responses: {
        help: 'Tôi có thể giúp bạn với nhiều việc! Hãy hỏi tôi về năng suất, cảm xúc, hoặc bất kỳ điều gì bạn cần hỗ trợ! 💪',
        
        emotions: {
            happy: 'Tuyệt vời! Hãy tận dụng trạng thái tích cực này để hoàn thành những việc quan trọng nhé! 🌟',
            sad: 'Tôi hiểu bạn đang buồn. Hãy nghỉ ngơi một chút, nghe nhạc thư giãn, hoặc nói chuyện với ai đó bạn tin tưởng. Mọi thứ sẽ tốt lên! 💙',
            angry: 'Khi tức giận, hãy thử kỹ thuật 4-7-8: Hít vào 4 giây, giữ 7 giây, thở ra 8 giây. Lặp lại 3 lần sẽ giúp bạn bình tĩnh hơn! 🧘‍♀️',
            surprised: 'Wow! Có điều gì bất ngờ xảy ra à? Hãy dành thời gian để xử lý thông tin mới này nhé! ✨',
            fearful: 'Đừng lo lắng! Hãy chia nhỏ vấn đề thành từng phần nhỏ để dễ giải quyết hơn. Tôi sẽ hỗ trợ bạn! 🤝',
            neutral: 'Bạn đang rất tập trung! Đây là thời điểm tuyệt vời để làm những công việc quan trọng! 💼'
        },
        
        productivity: {
            high: 'Năng suất cao! Hãy tiếp tục duy trì momentum này! 🚀',
            medium: 'Không tệ! Thử nghỉ ngơi 5-10 phút rồi quay lại nhé! ☕',
            low: 'Hãy nghỉ ngơi một chút. Có thể bạn cần thay đổi không gian làm việc hoặc làm việc khác? 🌿'
        }
    },
    
    tips: [
        '💡 Mẹo: Sử dụng quy tắc 20-20-20: Cứ 20 phút nhìn vật cách 20 feet trong 20 giây!',
        '🎯 Hãy đặt mục tiêu SMART: Cụ thể, Đo được, Khả thi, Liên quan, Có thời hạn!',
        '🧠 Não bộ làm việc hiệu quả nhất khi nghỉ ngơi đủ giấc (7-8 tiếng/đêm)!',
        '☕ Uống nước đều đặn giúp não bộ hoạt động tốt hơn 15%!',
        '🎵 Âm nhạc cổ điển hoặc white noise giúp tăng tập trung!',
        '🌱 Cây xanh trong văn phòng có thể tăng năng suất lên 15%!',
        '📱 Tắt thông báo không cần thiết để tránh phân tán!',
        '🏃‍♂️ Vận động 10 phút có thể tăng năng suất cả ngày!'
    ]
};

// Enhanced error messages
const ERROR_MESSAGES = {
    camera: {
        permission: 'Không thể truy cập camera. Vui lòng cấp quyền truy cập camera trong cài đặt trình duyệt!',
        notFound: 'Không tìm thấy camera. Vui lòng kiểm tra camera có hoạt động không!',
        inUse: 'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác!',
        generic: 'Lỗi camera không xác định. Thử khởi động lại trình duyệt!'
    },
    
    models: {
        loading: 'Không thể tải mô hình AI. Kiểm tra kết nối mạng!',
        timeout: 'Tải mô hình bị timeout. Kết nối mạng chậm!',
        cors: 'Lỗi CORS. Sử dụng HTTPS hoặc server local!',
        memory: 'Không đủ bộ nhớ. Đóng các tab khác và thử lại!'
    },
    
    webgl: {
        notSupported: 'WebGL không được hỗ trợ. Cập nhật trình duyệt hoặc driver card đồ họa!',
        contextLost: 'WebGL context bị mất. Tải lại trang để khôi phục!',
        outOfMemory: 'WebGL hết bộ nhớ. Giảm chất lượng video hoặc đóng tab khác!'
    }
};

// System requirements check
const SYSTEM_REQUIREMENTS = {
    minBrowserVersions: {
        chrome: 70,
        firefox: 65,
        safari: 12,
        edge: 79
    },
    
    features: {
        webgl: 'WebGL hỗ trợ',
        getUserMedia: 'Camera API hỗ trợ',
        wasm: 'WebAssembly hỗ trợ'
    },
    
    recommendations: {
        cpu: 'Intel i3 / AMD Ryzen 3 trở lên',
        ram: '4GB RAM trở lên',
        browser: 'Chrome 90+ hoặc Firefox 88+ (khuyến nghị)',
        connection: 'Kết nối internet ổn định'
    }
};