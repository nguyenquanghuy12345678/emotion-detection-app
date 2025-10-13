class AIAssistant {
    constructor() {
        this.personality = AI_PERSONALITY || {};
        this.chatHistory = [];
        this.initialized = false;
        this.init();
    }

    init() {
        try {
            console.log('🤖 AI Assistant initializing...');
            this.setupEventListeners();
            this.initialized = true;
            console.log('✅ AI Assistant ready');
        } catch (error) {
            console.error('AI Assistant initialization error:', error);
        }
    }

    setupEventListeners() {
        const chatInput = document.getElementById('chatInput');
        const chatSend = document.getElementById('chatSend');

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        if (chatSend) {
            chatSend.addEventListener('click', () => {
                this.sendMessage();
            });
        }
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';

        // Add user message to chat
        this.addMessageToChat('user', message);

        // Generate AI response
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessageToChat('bot', response);
        }, 500);
    }

    addMessageToChat(type, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${type}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'user' ? '👤' : '🤖';

        const content = document.createElement('div');
        content.className = 'message-content';

        const text = document.createElement('div');
        text.className = 'message-text';
        text.innerHTML = message.replace(/\n/g, '<br>');

        content.appendChild(text);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Store in history
        this.chatHistory.push({ type, message, timestamp: Date.now() });
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Emotion-related responses
        if (lowerMessage.includes('cảm xúc') || lowerMessage.includes('tâm trạng')) {
            return this.getEmotionResponse();
        }

        // Productivity responses
        if (lowerMessage.includes('năng suất') || lowerMessage.includes('công việc')) {
            return this.getProductivityResponse();
        }

        // Stress/tired responses
        if (lowerMessage.includes('mệt') || lowerMessage.includes('stress') || lowerMessage.includes('căng thẳng')) {
            return this.getStressResponse();
        }

        // Help responses
        if (lowerMessage.includes('help') || lowerMessage.includes('giúp') || lowerMessage.includes('hỗ trợ')) {
            return this.getHelpResponse();
        }

        // Default response
        return this.getDefaultResponse();
    }

    getEmotionResponse() {
        if (window.emotionApp && window.emotionApp.emotionHandler) {
            const currentEmotion = window.emotionApp.emotionHandler.getCurrentEmotion();
            const emotionConfig = EMOTIONS[currentEmotion];
            
            if (emotionConfig) {
                return `Tôi thấy bạn đang ${emotionConfig.label.toLowerCase()}! ${emotionConfig.message}\n\n💡 Đề xuất: ${emotionConfig.productivity?.suggestion || 'Hãy giữ tinh thần tích cực!'}`;
            }
        }
        
        return 'Hãy bật camera để tôi có thể phân tích cảm xúc của bạn! Tôi sẽ đưa ra những lời khuyên phù hợp với tâm trạng hiện tại.';
    }

    getProductivityResponse() {
        const responses = [
            'Để tăng năng suất, hãy thử:\n\n🍅 Kỹ thuật Pomodoro (25 phút tập trung + 5 phút nghỉ)\n⏰ Lập kế hoạch chi tiết cho ngày\n🎯 Ưu tiên 3 việc quan trọng nhất\n🚫 Loại bỏ yếu tố gây phân tâm\n💧 Uống đủ nước và nghỉ ngơi đều đặn',
            
            'Một số tips tăng năng suất hiệu quả:\n\n🧠 Làm việc khó vào buổi sáng khi não bộ tỉnh táo\n📱 Tắt thông báo không cần thiết\n🌱 Tạo môi trường làm việc thoải mái\n🎵 Nghe nhạc tập trung (lo-fi, classical)\n⚡ Chia nhỏ task lớn thành các phần nhỏ hơn',
            
            'Bạn muốn tối ưu năng suất? Đây là bí quyết:\n\n🎪 Sử dụng quy tắc 2 phút (làm ngay việc < 2 phút)\n📊 Theo dõi thời gian làm việc\n🏃‍♂️ Vận động 10 phút mỗi 2 tiếng\n🍎 Ăn snack healthy cho não bộ\n😴 Ngủ đủ 7-8 tiếng mỗi đêm'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    getStressResponse() {
        const responses = [
            'Để giảm stress hiệu quả:\n\n🧘‍♀️ Thở sâu 4-7-8 (hít 4s, giữ 7s, thở ra 8s)\n🚶‍♂️ Đi bộ 10-15 phút ngoài trời\n🎵 Nghe nhạc thư giãn\n☕ Uống trà thảo mộc\n📱 Tạm dừng công nghệ 30 phút\n🛁 Tắm nước ấm hoặc massage nhẹ',
            
            'Khi cảm thấy mệt mỏi:\n\n⏸️ Nghỉ ngơi 15-20 phút\n💧 Uống nước lọc\n🌅 Ra ngoài hít thở không khí trong lành\n🎯 Làm việc nhẹ nhàng, không gây áp lực\n😊 Nói chuyện với người thân\n🍃 Thực hiện mindfulness',
            
            'Stress là bình thường, hãy:\n\n📝 Viết ra những gì đang lo lắng\n🎨 Làm điều gì đó sáng tạo\n🤗 Ôm gối hoặc thú bông\n🍫 Ăn chocolate đen (ít lượng)\n📞 Gọi điện cho bạn bè\n⭐ Nhắc nhở bản thân về những điều tích cực'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    getHelpResponse() {
        return `Tôi có thể giúp bạn với:\n\n🎭 **Phân tích cảm xúc**: Theo dõi tâm trạng real-time\n💼 **Tối ưu năng suất**: Pomodoro, task management\n📊 **Thống kê chi tiết**: Báo cáo tâm trạng và hiệu suất\n🧘 **Giảm stress**: Kỹ thuật thư giãn và meditation\n💡 **Tư vấn cá nhân**: Dựa trên cảm xúc hiện tại\n⚡ **Tips hàng ngày**: Cải thiện cuộc sống\n\nHãy hỏi tôi về bất cứ điều gì bạn cần! 😊`;
    }

    getDefaultResponse() {
        const responses = [
            'Tôi hiểu bạn đang cần hỗ trợ! Hãy cho tôi biết cụ thể về:\n• Tâm trạng hiện tại\n• Công việc cần làm\n• Khó khăn đang gặp phải\n\nTôi sẽ đưa ra lời khuyên phù hợp nhất! 💪',
            
            'Tôi ở đây để giúp bạn! Bạn có thể hỏi tôi về:\n• Cách tăng năng suất làm việc\n• Kỹ thuật giảm stress\n• Phân tích cảm xúc\n• Lời khuyên sức khỏe tinh thần\n\nHãy nói với tôi bạn cần gì nhé! 🌟',
            
            'Xin chào! Tôi là AI Assistant thông minh của bạn. Hãy chia sẻ với tôi:\n• Bạn đang làm gì?\n• Cảm thấy thế nào?\n• Cần hỗ trợ gì?\n\nTôi sẽ đưa ra những gợi ý tuyệt vời! 🚀'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Quick action functions
    analyzeCurrentMood() {
        return this.getEmotionResponse();
    }

    suggestWorkSchedule() {
        const hour = new Date().getHours();
        let schedule = '';

        if (hour < 12) {
            schedule = '🌅 **Lịch buổi sáng**:\n\n• 9:00-11:00: Công việc quan trọng nhất\n• 11:00-11:15: Nghỉ ngơi\n• 11:15-12:00: Email & meeting\n\n💡 Buổi sáng não bộ tỉnh táo nhất!';
        } else if (hour < 18) {
            schedule = '☀️ **Lịch buổi chiều**:\n\n• 13:00-15:00: Tập trung deep work\n• 15:00-15:30: Coffee break\n• 15:30-17:30: Collaboration & review\n\n💡 Tận dụng energy sau bữa trưa!';
        } else {
            schedule = '🌙 **Lịch buổi tối**:\n\n• 18:00-19:30: Hoàn thiện task\n• 19:30-20:00: Planning ngày mai\n• 20:00+: Thư giãn & self-care\n\n💡 Chuẩn bị tốt cho ngày mới!';
        }

        return schedule;
    }

    handleFatigue() {
        return this.getStressResponse();
    }

    breathingExercise() {
        return '🧘‍♀️ **Bài tập thở 4-7-8 giảm stress**:\n\n1️⃣ Hít vào qua mũi trong 4 giây\n2️⃣ Giữ hơi thở trong 7 giây\n3️⃣ Thở ra qua miệng trong 8 giây\n4️⃣ Lặp lại 4-6 lần\n\n✨ Bài tập này giúp kích hoạt hệ thần kinh phó giao cảm, giảm cortisol và tạo cảm giác bình tĩnh.\n\n💡 **Tips**: Thực hiện ở nơi yên tĩnh, ngồi thẳng lưng, đặt tay lên bụng để cảm nhận hơi thở.';
    }

    getProductivityTips() {
        return this.getProductivityResponse();
    }
}

// Global functions for quick actions
window.askAI = function(message) {
    if (window.aiAssistant) {
        window.aiAssistant.addMessageToChat('user', message);
        setTimeout(() => {
            const response = window.aiAssistant.generateResponse(message);
            window.aiAssistant.addMessageToChat('bot', response);
        }, 500);
        
        // Show chat panel
        const chatPanel = document.getElementById('chatPanel');
        if (chatPanel) {
            chatPanel.classList.add('active');
        }
    }
};

window.generateProductivityReport = function() {
    const report = `📊 **Báo cáo năng suất hôm nay**\n\n• Thời gian làm việc: ${Math.floor(Math.random() * 6) + 4} giờ\n• Số task hoàn thành: ${Math.floor(Math.random() * 8) + 3}\n• Điểm tập trung: ${Math.floor(Math.random() * 30) + 70}%\n• Cảm xúc chủ đạo: Tích cực\n\n💡 **Đề xuất**: Hãy nghỉ ngơi 15 phút và tiếp tục với energy mới!`;
    
    window.askAI(report);
};

// Initialize AI Assistant
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});

// Chat toggle function
window.toggleChat = function() {
    const chatPanel = document.getElementById('chatPanel');
    if (chatPanel) {
        chatPanel.classList.toggle('active');
    }
};

window.sendMessage = function() {
    if (window.aiAssistant) {
        window.aiAssistant.sendMessage();
    }
};