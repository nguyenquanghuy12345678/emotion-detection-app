// ============================================
// AI CHATBOT ASSISTANT - TRỢ LÝ ẢO THÔNG MINH
// ============================================

class AIAssistant {
    constructor(productivityTracker) {
        this.tracker = productivityTracker;
        this.conversationHistory = [];
        this.isListening = false;
        this.recognition = null;
        this.isInitialized = false;
        
        // Buffer để xử lý real-time data
        this.emotionBuffer = [];
        this.bufferSize = 5; // Phân tích mỗi 5 emotions
        this.lastProcessTime = 0;
        this.processInterval = 3000; // Xử lý mỗi 3 giây
        
        // Trạng thái tự động
        this.autoMode = {
            enabled: true, // Bật mặc định
            alerts: true,
            suggestions: true,
            reports: true,
            voiceAlerts: false
        };
        
        // Ngưỡng cảnh báo
        this.thresholds = {
            stressLevel: 3, // 3 lần liên tiếp căng thẳng
            tirednessLevel: 5, // 5 lần liên tiếp mệt mỏi
            focusDropLevel: 40, // Điểm tập trung < 40
            noFaceDetected: 10 // 10 lần không phát hiện khuôn mặt
        };
        
        // Bộ đếm cảnh báo
        this.alertCounters = {
            stress: 0,
            tiredness: 0,
            noFace: 0,
            lastAlert: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupVoiceRecognition();
        this.setupChatUI();
        this.loadSettings();
        
        // Đợi 1 giây để đảm bảo DOM đã sẵn sàng
        setTimeout(() => {
            this.isInitialized = true;
            console.log('✅ AI Assistant initialized and ready!');
            
            // Hiển thị thông báo chào mừng
            if (this.autoMode.enabled) {
                this.showWelcomeMessage();
            }
        }, 1000);
    }
    
    showWelcomeMessage() {
        this.addMessageToChat('bot', 
            '👋 Xin chào! Tôi là AI Assistant.\n\n' +
            '✅ Chế độ tự động đã BẬT\n' +
            '✅ Tôi sẽ theo dõi và cảnh báo tự động\n\n' +
            'Bạn có thể:\n' +
            '• Hỏi "Báo cáo năng suất"\n' +
            '• Nói "Bắt đầu Pomodoro"\n' +
            '• Chat bất cứ lúc nào!'
        );
    }
    
    // ============================================
    // REAL-TIME EMOTION PROCESSING - OPTIMIZED
    // ============================================
    
    processEmotionData(emotion, confidence, faceDetected) {
        if (!this.isInitialized || !this.autoMode.enabled) return;
        
        const now = Date.now();
        
        // Thêm vào buffer
        this.emotionBuffer.push({
            emotion,
            confidence,
            faceDetected,
            timestamp: now
        });
        
        // Giữ buffer size
        if (this.emotionBuffer.length > this.bufferSize * 2) {
            this.emotionBuffer.shift();
        }
        
        // Xử lý theo interval để tránh lag
        if (now - this.lastProcessTime >= this.processInterval) {
            this.analyzeEmotionBuffer();
            this.lastProcessTime = now;
        }
        
        // Xử lý no face ngay lập tức
        if (!faceDetected) {
            this.handleNoFaceDetected();
        } else {
            this.alertCounters.noFace = 0; // Reset counter
        }
    }
    
    analyzeEmotionBuffer() {
        if (this.emotionBuffer.length < this.bufferSize) return;
        
        const recentEmotions = this.emotionBuffer.slice(-this.bufferSize);
        
        // Phân tích patterns
        this.detectStressPattern(recentEmotions);
        this.detectTirednessPattern(recentEmotions);
        this.checkFocusLevel();
        this.provideContextualSuggestions();
    }
    
    detectStressPattern(emotions) {
        const stressEmotions = ['angry', 'disgusted', 'fearful'];
        const stressCount = emotions.filter(e => 
            e.faceDetected && stressEmotions.includes(e.emotion)
        ).length;
        
        if (stressCount >= this.thresholds.stressLevel) {
            this.alertCounters.stress++;
            
            if (this.alertCounters.stress >= 2) {
                this.sendAlert('stress', 
                    '🚨 Cảnh Báo Căng Thẳng', 
                    `Bạn đang căng thẳng (${stressCount}/${this.bufferSize} lần gần đây).\n\nHãy:\n• Thở sâu 5 lần\n• Đứng dậy vận động\n• Nghỉ ngơi 10 phút`,
                    'high'
                );
                this.alertCounters.stress = 0;
            }
        } else {
            this.alertCounters.stress = 0;
        }
    }
    
    detectTirednessPattern(emotions) {
        const tiredEmotions = ['sad', 'fearful'];
        const tiredCount = emotions.filter(e => 
            e.faceDetected && tiredEmotions.includes(e.emotion)
        ).length;
        
        if (tiredCount >= this.thresholds.tirednessLevel - 2) { // Nhạy hơn
            this.alertCounters.tiredness++;
            
            if (this.alertCounters.tiredness >= 2) {
                this.sendAlert('tired',
                    '😴 Cảnh Báo Mệt Mỏi',
                    `Bạn có vẻ rất mệt (${tiredCount}/${this.bufferSize} lần).\n\nGợi ý:\n• Nghỉ ngơi 15-20 phút\n• Ngủ trưa nếu có thể\n• Uống nước, ăn nhẹ`,
                    'medium'
                );
                this.alertCounters.tiredness = 0;
            }
        } else {
            this.alertCounters.tiredness = 0;
        }
    }
    
    checkFocusLevel() {
        if (!this.tracker) return;
        
        const focusScore = this.tracker.focusScore;
        
        if (focusScore < this.thresholds.focusDropLevel) {
            const now = Date.now();
            
            // Cảnh báo mỗi 5 phút
            if (!this.lastFocusAlert || now - this.lastFocusAlert > 300000) {
                this.sendAlert('focus',
                    '🎯 Mất Tập Trung',
                    `Điểm tập trung: ${Math.round(focusScore)}/100\n\nThử:\n• Bật nhạc tập trung\n• Kỹ thuật Pomodoro\n• Loại bỏ phiền nhiễu`,
                    'medium'
                );
                this.lastFocusAlert = now;
            }
        }
    }
    
    handleNoFaceDetected() {
        this.alertCounters.noFace++;
        
        if (this.alertCounters.noFace >= this.thresholds.noFaceDetected) {
            this.sendAlert('absence',
                '👤 Phát Hiện Vắng Mặt',
                `Không thấy bạn trước camera (${this.alertCounters.noFace} giây).\n\n⚠️ Đang ghi nhận thời gian vắng mặt.`,
                'high'
            );
            
            // Ghi nhận vắng mặt
            if (this.tracker) {
                this.tracker.recordAbsence(Date.now());
            }
            
            // Reset để tránh spam
            this.alertCounters.noFace = 0;
        }
    }
    
    provideContextualSuggestions() {
        if (!this.autoMode.suggestions) return;
        
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Gợi ý theo thời gian (chỉ 1 lần/ngày)
        const todayKey = now.toDateString();
        
        if (!this.suggestionCache) {
            this.suggestionCache = {};
        }
        
        // Giờ ăn trưa
        if (hour === 12 && minute < 30 && !this.suggestionCache[`lunch_${todayKey}`]) {
            this.sendSuggestion('🍽️ Giờ Ăn Trưa', 
                'Đã 12h rồi! Hãy nghỉ ngơi và ăn trưa để nạp năng lượng nhé!'
            );
            this.suggestionCache[`lunch_${todayKey}`] = true;
        }
        
        // Làm việc muộn
        if (hour >= 22 && !this.suggestionCache[`night_${todayKey}`]) {
            this.sendSuggestion('🌙 Làm Việc Muộn', 
                'Đã 10h đêm rồi! Làm việc khuya ảnh hưởng sức khỏe.\nHãy nghỉ ngơi sớm để ngày mai làm việc tốt hơn!'
            );
            this.suggestionCache[`night_${todayKey}`] = true;
        }
    }
    
    // ============================================
    // GIÁM SÁT TỰ ĐỘNG - REMOVED (Moved to processEmotionData)
    // ============================================
    
    // ============================================
    // HỆ THỐNG CẢNH BÁO
    // ============================================
    
    sendAlert(type, title, message, priority = 'medium') {
        if (!this.autoMode.alerts) return;
        
        // Hiển thị UI alert
        this.showAlert(title, message, priority);
        
        // Phát âm thanh
        this.playAlertSound(priority);
        
        // Browser notification
        this.sendBrowserNotification(title, message);
        
        // Voice alert (nếu bật)
        if (this.autoMode.voiceAlerts && priority === 'high') {
            this.speak(message.split('\n')[0]); // Chỉ đọc dòng đầu
        }
        
        // Ghi log
        this.logAlert(type, title, message, priority);
        
        console.log(`🔔 Alert [${type}/${priority}]:`, title);
    }
    
    sendSuggestion(title, message) {
        if (!this.autoMode.suggestions) return;
        this.showSuggestion(title, message);
    }
    
    showAlert(title, message, priority) {
        const alertBox = document.createElement('div');
        alertBox.className = `ai-alert ai-alert-${priority} fade-in`;
        alertBox.innerHTML = `
            <div class="alert-header">
                <span class="alert-icon">${this.getAlertIcon(priority)}</span>
                <span class="alert-title">${title}</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
            <div class="alert-message">${message.replace(/\n/g, '<br>')}</div>
            <div class="alert-footer">
                <small>${new Date().toLocaleTimeString('vi-VN')}</small>
            </div>
        `;
        
        const container = document.getElementById('alertContainer') || this.createAlertContainer();
        container.appendChild(alertBox);
        
        // Giới hạn số alert (max 3)
        const alerts = container.querySelectorAll('.ai-alert');
        if (alerts.length > 3) {
            alerts[0].remove();
        }
        
        // Auto remove sau 30 giây với animation
        setTimeout(() => {
            if (alertBox.parentElement) {
                alertBox.classList.add('fade-out');
                setTimeout(() => alertBox.remove(), 500);
            }
        }, 30000);
    }
    
    showSuggestion(title, message) {
        const suggestionBox = document.createElement('div');
        suggestionBox.className = 'ai-suggestion';
        suggestionBox.innerHTML = `
            <div class="suggestion-header">
                <span class="suggestion-icon">💡</span>
                <span class="suggestion-title">${title}</span>
                <button class="suggestion-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
            <div class="suggestion-message">${message.replace(/\n/g, '<br>')}</div>
        `;
        
        const container = document.getElementById('alertContainer') || this.createAlertContainer();
        container.appendChild(suggestionBox);
        
        setTimeout(() => {
            if (suggestionBox.parentElement) {
                suggestionBox.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => suggestionBox.remove(), 300);
            }
        }, 20000);
    }
    
    createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.className = 'alert-container';
        document.body.appendChild(container);
        return container;
    }
    
    getAlertIcon(priority) {
        const icons = {
            high: '🚨',
            medium: '⚠️',
            low: 'ℹ️'
        };
        return icons[priority] || 'ℹ️';
    }
    
    playAlertSound(priority) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (priority === 'high') {
            // Âm thanh khẩn cấp
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.5;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 880;
                gain2.gain.value = 0.5;
                osc2.start();
                osc2.stop(audioContext.currentTime + 0.2);
            }, 300);
        } else {
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    }
    
    sendBrowserNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'ai-assistant',
                requireInteraction: true
            });
        }
    }
    
    dismissAlert(button) {
        const alert = button.closest('.ai-alert');
        if (alert) alert.remove();
    }
    
    takeBreak() {
        // Tự động bắt đầu break time
        if (this.tracker.isPomodoroRunning) {
            this.tracker.stopPomodoro();
        }
        
        this.speak('Được rồi, hãy nghỉ ngơi thư giãn nhé!');
        this.showBreakScreen();
    }
    
    showBreakScreen() {
        const breakScreen = document.createElement('div');
        breakScreen.className = 'break-screen';
        breakScreen.innerHTML = `
            <div class="break-content">
                <h1>☕ Thời Gian Nghỉ Ngơi</h1>
                <p>Hãy đứng dậy, vận động và thư giãn!</p>
                <div class="break-timer" id="breakTimer">5:00</div>
                <button onclick="aiAssistant.endBreak()" class="btn-end-break">Kết thúc nghỉ</button>
            </div>
        `;
        
        document.body.appendChild(breakScreen);
        
        let breakTime = 300; // 5 phút
        const interval = setInterval(() => {
            breakTime--;
            const mins = Math.floor(breakTime / 60);
            const secs = breakTime % 60;
            document.getElementById('breakTimer').textContent = 
                `${mins}:${String(secs).padStart(2, '0')}`;
            
            if (breakTime <= 0) {
                clearInterval(interval);
                this.endBreak();
            }
        }, 1000);
        
        breakScreen.dataset.intervalId = interval;
    }
    
    endBreak() {
        const breakScreen = document.querySelector('.break-screen');
        if (breakScreen) {
            const intervalId = breakScreen.dataset.intervalId;
            if (intervalId) clearInterval(intervalId);
            breakScreen.remove();
        }
        
        this.speak('Hết giờ nghỉ! Hãy tiếp tục làm việc với tinh thần mới!');
    }
    
    // ============================================
    // AI CHATBOT
    // ============================================
    
    setupChatUI() {
        // Chat UI sẽ được tạo trong HTML
    }
    
    async processMessage(userMessage) {
        // Thêm tin nhắn người dùng
        this.addMessageToChat('user', userMessage);
        
        // Phân tích ý định
        const intent = this.analyzeIntent(userMessage);
        const response = await this.generateResponse(intent, userMessage);
        
        // Thêm phản hồi bot
        this.addMessageToChat('bot', response);
        
        // Thực hiện hành động nếu cần
        this.executeAction(intent);
    }
    
    analyzeIntent(message) {
        const msg = message.toLowerCase();
        
        // Phân loại ý định
        if (msg.includes('báo cáo') || msg.includes('thống kê') || msg.includes('report')) {
            return { type: 'report', data: null };
        }
        if (msg.includes('bắt đầu') || msg.includes('start') || msg.includes('pomodoro')) {
            return { type: 'start_pomodoro', data: null };
        }
        if (msg.includes('dừng') || msg.includes('stop')) {
            return { type: 'stop', data: null };
        }
        if (msg.includes('nghỉ') || msg.includes('break')) {
            return { type: 'break', data: null };
        }
        if (msg.includes('cảm xúc') || msg.includes('emotion')) {
            return { type: 'emotion_status', data: null };
        }
        if (msg.includes('tập trung') || msg.includes('focus')) {
            return { type: 'focus_status', data: null };
        }
        if (msg.includes('gợi ý') || msg.includes('suggest') || msg.includes('help')) {
            return { type: 'suggestion', data: null };
        }
        if (msg.includes('xuất') || msg.includes('export')) {
            return { type: 'export', data: null };
        }
        
        return { type: 'general', data: null };
    }
    
    async generateResponse(intent, userMessage) {
        switch (intent.type) {
            case 'report':
                return this.generateReport();
            
            case 'start_pomodoro':
                this.tracker.startPomodoro();
                return '✅ Đã bắt đầu Pomodoro! Tập trung làm việc trong 25 phút nhé!';
            
            case 'stop':
                this.tracker.stopPomodoro();
                return '⏸️ Đã tạm dừng. Bạn muốn làm gì tiếp theo?';
            
            case 'break':
                this.takeBreak();
                return '☕ Đã bắt đầu giờ nghỉ. Hãy thư giãn!';
            
            case 'emotion_status':
                return this.getEmotionStatus();
            
            case 'focus_status':
                return this.getFocusStatus();
            
            case 'suggestion':
                return this.getPersonalizedSuggestion();
            
            case 'export':
                this.tracker.exportData();
                return '💾 Đang xuất báo cáo... File sẽ được tải xuống!';
            
            default:
                return this.getGeneralResponse(userMessage);
        }
    }
    
    generateReport() {
        const stats = this.tracker.stats;
        const focusScore = Math.round(this.tracker.focusScore);
        const emotionData = this.tracker.generateEmotionChart();
        
        let report = `📊 **BÁO CÁO NĂNG SUẤT**\n\n`;
        report += `🎯 Điểm tập trung: ${focusScore}/100\n`;
        report += `⏱️ Tổng thời gian: ${this.tracker.formatTime(stats.totalWorkTime)}\n`;
        report += `🍅 Pomodoro hoàn thành: ${this.tracker.pomodoroCount}\n\n`;
        
        report += `📈 **Phân bố cảm xúc:**\n`;
        emotionData.forEach(item => {
            const emoji = this.tracker.getEmotionEmoji(item.emotion);
            report += `${emoji} ${item.emotion}: ${item.percentage}%\n`;
        });
        
        report += `\n💡 **Đánh giá:** `;
        if (focusScore >= 80) {
            report += 'Xuất sắc! Bạn đang làm việc rất hiệu quả!';
        } else if (focusScore >= 60) {
            report += 'Tốt! Hãy tiếp tục duy trì.';
        } else {
            report += 'Cần cải thiện. Hãy nghỉ ngơi và tập trung hơn!';
        }
        
        return report;
    }
    
    getEmotionStatus() {
        const recent = this.tracker.emotionHistory.slice(-1)[0];
        if (!recent) return 'Chưa có dữ liệu cảm xúc.';
        
        const emoji = this.tracker.getEmotionEmoji(recent.emotion);
        return `${emoji} Hiện tại bạn đang cảm thấy: **${recent.emotion}** (${(recent.confidence * 100).toFixed(1)}% chắc chắn)`;
    }
    
    getFocusStatus() {
        const score = Math.round(this.tracker.focusScore);
        let assessment = '';
        
        if (score >= 80) assessment = 'Rất tốt! 🎯';
        else if (score >= 60) assessment = 'Ổn 👍';
        else if (score >= 40) assessment = 'Cần cải thiện 📈';
        else assessment = 'Đang mất tập trung! ⚠️';
        
        return `🎯 Điểm tập trung hiện tại: ${score}/100 - ${assessment}`;
    }
    
    getPersonalizedSuggestion() {
        const score = this.tracker.focusScore;
        const recent = this.tracker.emotionHistory.slice(-5);
        
        const suggestions = [
            '💡 Hãy thử kỹ thuật Pomodoro (25 phút làm việc, 5 phút nghỉ)',
            '☕ Uống nước hoặc cà phê để tỉnh táo hơn',
            '🎵 Bật nhạc tập trung (lofi, classical)',
            '🧘 Thực hiện bài tập thở sâu 5 phút',
            '🚶 Đứng dậy đi bộ vài phút',
            '💪 Vươn vai, xoay cổ để giảm căng thẳng',
            '🌿 Nhìn ra ngoài cửa sổ, thư giãn mắt'
        ];
        
        if (score < 50) {
            return '🔴 Bạn đang mất tập trung!\n\n' + 
                   'Gợi ý:\n' + 
                   suggestions.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n');
        }
        
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }
    
    getGeneralResponse(message) {
        const responses = [
            'Tôi là AI Assistant, tôi có thể giúp bạn:\n• Theo dõi năng suất\n• Báo cáo thống kê\n• Đề xuất nghỉ ngơi\n• Điều khiển Pomodoro\n\nBạn cần gì?',
            'Tôi đang lắng nghe! Hãy hỏi tôi về năng suất, cảm xúc, hoặc yêu cầu tôi làm gì đó.',
            'Xin lỗi, tôi chưa hiểu. Bạn có thể hỏi:\n• "Báo cáo năng suất"\n• "Bắt đầu Pomodoro"\n• "Cảm xúc hiện tại"\n• "Gợi ý tập trung"'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    executeAction(intent) {
        // Đã thực hiện trong generateResponse
    }
    
    addMessageToChat(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${sender}`;
        
        const time = new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">
                <div class="message-text">${message.replace(/\n/g, '<br>')}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Lưu lịch sử
        this.conversationHistory.push({ sender, message, time: Date.now() });
    }
    
    // ============================================
    // VOICE ASSISTANT
    // ============================================
    
    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.log('Voice recognition not supported');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'vi-VN';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.processMessage(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }
    
    startListening() {
        if (!this.recognition) {
            alert('Trình duyệt không hỗ trợ nhận diện giọng nói!');
            return;
        }
        
        this.isListening = true;
        this.recognition.start();
        this.updateVoiceButton(true);
    }
    
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.updateVoiceButton(false);
    }
    
    updateVoiceButton(listening) {
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.textContent = listening ? '🎤 Đang nghe...' : '🎤 Nói';
            voiceBtn.style.background = listening ? '#f5576c' : '';
        }
    }
    
    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }
    
    // ============================================
    // SETTINGS & STORAGE
    // ============================================
    
    toggleAutoMode() {
        this.autoMode.enabled = !this.autoMode.enabled;
        this.saveSettings();
        
        const status = this.autoMode.enabled ? 'BẬT' : 'TẮT';
        this.addMessageToChat('bot', `🤖 Chế độ tự động đã ${status}`);
    }
    
    updateSettings(settings) {
        Object.assign(this.autoMode, settings);
        this.saveSettings();
    }
    
    saveSettings() {
        localStorage.setItem('aiAssistantSettings', JSON.stringify({
            autoMode: this.autoMode,
            thresholds: this.thresholds
        }));
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('aiAssistantSettings');
            if (saved) {
                const data = JSON.parse(saved);
                this.autoMode = data.autoMode || this.autoMode;
                this.thresholds = data.thresholds || this.thresholds;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    logAlert(type, title, message, priority) {
        const log = {
            type,
            title,
            message,
            priority,
            timestamp: Date.now()
        };
        
        const logs = JSON.parse(localStorage.getItem('alertLogs') || '[]');
        logs.unshift(log);
        logs.splice(100); // Giữ 100 logs gần nhất
        
        localStorage.setItem('alertLogs', JSON.stringify(logs));
    }
}

// Khởi tạo toàn cục
let aiAssistant = null;

// Khởi tạo khi DOM ready và có productivityTracker
document.addEventListener('DOMContentLoaded', () => {
    // Đợi productivityTracker được khởi tạo
    const checkTracker = setInterval(() => {
        if (window.productivityTracker) {
            aiAssistant = new AIAssistant(window.productivityTracker);
            window.aiAssistant = aiAssistant;
            clearInterval(checkTracker);
            console.log('✅ AI Assistant initialized!');
        }
    }, 100);
});
