/**
 * Production Co-working Space with Vercel API
 * Uses serverless functions instead of localStorage
 */

class CoworkingSpaceProduction {
    constructor() {
        this.currentRoom = null;
        this.peers = new Map();
        this.myId = this.generateUserId();
        this.myName = localStorage.getItem('cowork_username') || 'User' + Math.floor(Math.random() * 1000);
        this.pomodoroInterval = null;
        
        // API endpoint (auto-detect production or local)
        this.apiBase = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api'
            : '/api';
        
        this.initUI();
        this.startSync();
    }
    
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // ============= API METHODS =============
    
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }
        
        return await response.json();
    }
    
    async loadRoomsFromAPI() {
        try {
            const data = await this.apiRequest('/rooms');
            return data.rooms || [];
        } catch (error) {
            console.error('Failed to load rooms:', error);
            return [];
        }
    }
    
    async createRoomAPI(name) {
        try {
            const data = await this.apiRequest('/rooms', {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    creator: this.getMyInfo()
                })
            });
            return data.room;
        } catch (error) {
            console.error('Failed to create room:', error);
            throw error;
        }
    }
    
    async getRoomAPI(roomId) {
        try {
            const data = await this.apiRequest(`/rooms?roomId=${roomId}`);
            return data.room;
        } catch (error) {
            console.error('Failed to get room:', error);
            return null;
        }
    }
    
    async updateRoomAPI(roomId, action, data) {
        try {
            const result = await this.apiRequest(`/rooms?roomId=${roomId}`, {
                method: 'PUT',
                body: JSON.stringify({ action, data })
            });
            return result.room;
        } catch (error) {
            console.error('Failed to update room:', error);
            throw error;
        }
    }
    
    async deleteRoomAPI(roomId) {
        try {
            await this.apiRequest(`/rooms?roomId=${roomId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Failed to delete room:', error);
        }
    }
    
    // ============= ROOM MANAGEMENT =============
    
    async createRoom() {
        const roomName = prompt('Tên phòng:', 'Phòng Làm Việc ' + new Date().getHours() + 'h');
        if (!roomName) return;
        
        try {
            const room = await this.createRoomAPI(roomName);
            await this.joinRoom(room.id);
            this.showNotification('✅ Đã tạo phòng thành công!');
        } catch (error) {
            alert('❌ Lỗi tạo phòng: ' + error.message);
        }
    }
    
    async joinRoom(roomId) {
        try {
            const room = await this.getRoomAPI(roomId);
            
            if (!room) {
                alert('Phòng không tồn tại!');
                return;
            }
            
            // Join room via API
            this.currentRoom = await this.updateRoomAPI(roomId, 'join', this.getMyInfo());
            
            this.showRoomActive();
            this.renderRoom();
            
            // Broadcast join message
            await this.sendMessage(`${this.myName} đã tham gia phòng`, true);
            
            this.showNotification('✅ Đã vào phòng!');
        } catch (error) {
            alert('❌ Lỗi tham gia phòng: ' + error.message);
        }
    }
    
    async leaveRoom() {
        if (!this.currentRoom) return;
        
        try {
            await this.updateRoomAPI(this.currentRoom.id, 'leave', {
                userId: this.myId
            });
            
            await this.sendMessage(`${this.myName} đã rời phòng`, true);
            
            this.currentRoom = null;
            this.showNoRoom();
            
            if (this.pomodoroInterval) {
                clearInterval(this.pomodoroInterval);
            }
            
            this.showNotification('👋 Đã rời phòng');
        } catch (error) {
            console.error('Leave room error:', error);
        }
    }
    
    async shareRoom() {
        if (!this.currentRoom) return;
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?room=${this.currentRoom.id}`;
        const shareText = `🏢 Tham gia phòng làm việc "${this.currentRoom.name}"!\n\n${shareUrl}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: this.currentRoom.name,
                    text: shareText,
                    url: shareUrl
                });
                this.showNotification('✅ Đã chia sẻ!');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    this.copyToClipboard(shareUrl);
                }
            }
        } else {
            this.copyToClipboard(shareUrl);
        }
    }
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('📋 Đã copy link!');
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('📋 Đã copy link!');
        }
    }
    
    // ============= POMODORO =============
    
    async startSharedPomodoro() {
        if (!this.currentRoom) return;
        
        try {
            this.currentRoom = await this.updateRoomAPI(this.currentRoom.id, 'pomodoro', {
                isRunning: true,
                startedBy: this.myId,
                startedAt: Date.now()
            });
            
            document.getElementById('pomodoroStartBtn').disabled = true;
            document.getElementById('pomodoroPauseBtn').disabled = false;
            
            this.pomodoroInterval = setInterval(() => {
                this.updatePomodoroTimer();
            }, 1000);
            
            await this.sendMessage('🍅 Pomodoro đã bắt đầu!', true);
        } catch (error) {
            console.error('Start pomodoro error:', error);
        }
    }
    
    async pauseSharedPomodoro() {
        if (!this.currentRoom) return;
        
        try {
            this.currentRoom = await this.updateRoomAPI(this.currentRoom.id, 'pomodoro', {
                isRunning: false
            });
            
            document.getElementById('pomodoroStartBtn').disabled = false;
            document.getElementById('pomodoroPauseBtn').disabled = true;
            
            if (this.pomodoroInterval) {
                clearInterval(this.pomodoroInterval);
            }
            
            await this.sendMessage('⏸️ Pomodoro đã tạm dừng', true);
        } catch (error) {
            console.error('Pause pomodoro error:', error);
        }
    }
    
    async resetSharedPomodoro() {
        if (!this.currentRoom) return;
        
        try {
            this.currentRoom = await this.updateRoomAPI(this.currentRoom.id, 'pomodoro', {
                time: 1500,
                isRunning: false
            });
            
            this.updatePomodoroDisplay();
            
            if (this.pomodoroInterval) {
                clearInterval(this.pomodoroInterval);
            }
            
            document.getElementById('pomodoroStartBtn').disabled = false;
            document.getElementById('pomodoroPauseBtn').disabled = true;
        } catch (error) {
            console.error('Reset pomodoro error:', error);
        }
    }
    
    async updatePomodoroTimer() {
        if (!this.currentRoom || !this.currentRoom.pomodoro.isRunning) return;
        
        this.currentRoom.pomodoro.time--;
        
        if (this.currentRoom.pomodoro.time <= 0) {
            await this.pomodoroComplete();
            return;
        }
        
        // Update every 10 seconds to reduce API calls
        if (this.currentRoom.pomodoro.time % 10 === 0) {
            try {
                await this.updateRoomAPI(this.currentRoom.id, 'pomodoro', {
                    time: this.currentRoom.pomodoro.time
                });
            } catch (error) {
                console.error('Update timer error:', error);
            }
        }
        
        this.updatePomodoroDisplay();
    }
    
    async pomodoroComplete() {
        clearInterval(this.pomodoroInterval);
        
        const nextSession = this.currentRoom.pomodoro.session === 'work' ? 'break' : 'work';
        const nextTime = nextSession === 'work' ? 1500 : 300;
        
        try {
            this.currentRoom = await this.updateRoomAPI(this.currentRoom.id, 'pomodoro', {
                session: nextSession,
                time: nextTime,
                isRunning: false,
                complete: true
            });
            
            const message = nextSession === 'break' 
                ? '🎉 Pomodoro hoàn thành! Nghỉ ngơi 5 phút!'
                : '💼 Bắt đầu phiên làm việc mới!';
            
            await this.sendMessage(message, true);
            
            document.getElementById('pomodoroStartBtn').disabled = false;
            document.getElementById('pomodoroPauseBtn').disabled = true;
            
            this.updatePomodoroDisplay();
            this.playNotificationSound();
        } catch (error) {
            console.error('Complete pomodoro error:', error);
        }
    }
    
    updatePomodoroDisplay() {
        const time = this.currentRoom?.pomodoro.time || 1500;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        
        const timerEl = document.getElementById('sharedTimer');
        if (timerEl) {
            timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        const sessionEl = document.getElementById('pomodoroSession');
        if (sessionEl) {
            const session = this.currentRoom?.pomodoro.session || 'work';
            sessionEl.textContent = session === 'work' ? '💼 Làm việc' : '☕ Nghỉ ngơi';
        }
    }
    
    // ============= CHAT =============
    
    async sendMessage(content = null, isSystem = false) {
        if (!this.currentRoom) return;
        
        const messageContent = content || document.getElementById('chatInput')?.value.trim();
        if (!messageContent) return;
        
        const message = {
            id: Date.now(),
            type: isSystem ? 'system' : 'user',
            userId: this.myId,
            userName: this.myName,
            content: messageContent,
            timestamp: new Date().toISOString()
        };
        
        try {
            this.currentRoom = await this.updateRoomAPI(this.currentRoom.id, 'chat', message);
            this.renderChat();
            
            const input = document.getElementById('chatInput');
            if (input) input.value = '';
        } catch (error) {
            console.error('Send message error:', error);
        }
    }
    
    renderChat() {
        const chatDiv = document.getElementById('groupChat');
        if (!chatDiv || !this.currentRoom) return;
        
        const messages = this.currentRoom.chat.slice(-20);
        
        chatDiv.innerHTML = messages.map(msg => {
            if (msg.type === 'system') {
                return `<div class="chat-message system">${msg.content}</div>`;
            }
            
            const isMe = msg.userId === this.myId;
            return `
                <div class="chat-message ${isMe ? 'my-message' : 'peer-message'}">
                    <div class="message-header">
                        <strong>${this.escapeHtml(msg.userName)}</strong>
                        <span>${new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    <div class="message-content">${this.escapeHtml(msg.content)}</div>
                </div>
            `;
        }).join('');
        
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
    
    // ============= GOALS =============
    
    async setGoal() {
        const input = document.getElementById('myGoalInput');
        const goal = input?.value.trim();
        
        if (!goal || !this.currentRoom) return;
        
        const goalObj = {
            id: Date.now(),
            userId: this.myId,
            userName: this.myName,
            goal: goal,
            completed: false,
            timestamp: new Date().toISOString()
        };
        
        try {
            this.currentRoom = await this.updateRoomAPI(this.currentRoom.id, 'goal', goalObj);
            this.renderGoals();
            
            if (input) input.value = '';
            await this.sendMessage(`🎯 ${this.myName} đã đặt mục tiêu mới!`, true);
        } catch (error) {
            console.error('Set goal error:', error);
        }
    }
    
    async toggleGoal(goalId) {
        if (!this.currentRoom) return;
        
        const goal = this.currentRoom.goals.find(g => g.id === goalId);
        if (goal && goal.userId === this.myId) {
            goal.completed = !goal.completed;
            
            try {
                this.currentRoom = await this.updateRoomAPI(this.currentRoom.id, 'goal', goal);
                this.renderGoals();
                
                if (goal.completed) {
                    await this.sendMessage(`✅ ${this.myName} đã hoàn thành mục tiêu!`, true);
                }
            } catch (error) {
                console.error('Toggle goal error:', error);
            }
        }
    }
    
    renderGoals() {
        const goalsDiv = document.getElementById('goalsBoard');
        if (!goalsDiv || !this.currentRoom) return;
        
        const goals = this.currentRoom.goals;
        
        if (goals.length === 0) {
            goalsDiv.innerHTML = '<p class="hint">Chưa có mục tiêu nào</p>';
            return;
        }
        
        goalsDiv.innerHTML = goals.map(goal => `
            <div class="goal-item ${goal.completed ? 'completed' : ''}">
                <input type="checkbox" 
                       ${goal.completed ? 'checked' : ''}
                       ${goal.userId !== this.myId ? 'disabled' : ''}
                       onchange="window.coworkingSpace.toggleGoal(${goal.id})">
                <div class="goal-content">
                    <div class="goal-text">${this.escapeHtml(goal.goal)}</div>
                    <div class="goal-meta">${this.escapeHtml(goal.userName)}</div>
                </div>
            </div>
        `).join('');
    }
    
    // ============= RENDER & SYNC =============
    
    renderRoom() {
        if (!this.currentRoom) return;
        
        const roomNameEl = document.getElementById('roomName');
        if (roomNameEl) roomNameEl.textContent = this.currentRoom.name;
        
        this.renderMembers();
        this.renderChat();
        this.renderGoals();
        this.updatePomodoroDisplay();
        this.updateGroupStats();
    }
    
    renderMembers() {
        if (!this.currentRoom) return;
        
        const membersGrid = document.getElementById('membersGrid');
        const memberCount = document.getElementById('memberCount');
        const roomMemberCount = document.getElementById('roomMemberCount');
        
        const members = this.currentRoom.members;
        
        if (memberCount) memberCount.textContent = members.length;
        if (roomMemberCount) roomMemberCount.textContent = `${members.length} thành viên`;
        
        if (membersGrid) {
            membersGrid.innerHTML = members.map(member => {
                const isMe = member.id === this.myId;
                return `
                    <div class="member-card ${isMe ? 'me' : ''}">
                        <div class="member-avatar">${member.name.charAt(0).toUpperCase()}</div>
                        <div class="member-info">
                            <div class="member-name">${this.escapeHtml(member.name)} ${isMe ? '(Bạn)' : ''}</div>
                            <div class="member-status ${member.status}">${this.getStatusLabel(member.status)}</div>
                            <div class="member-emotion">${this.escapeHtml(member.emotion)}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    updateGroupStats() {
        if (!this.currentRoom) return;
        
        const members = this.currentRoom.members;
        const avgFocus = members.length > 0 
            ? members.reduce((sum, m) => sum + (m.focusScore || 50), 0) / members.length 
            : 0;
        
        const groupFocusBar = document.getElementById('groupFocusBar');
        const groupFocusScore = document.getElementById('groupFocusScore');
        const groupPomodoroCount = document.getElementById('groupPomodoroCount');
        const groupWorkTime = document.getElementById('groupWorkTime');
        
        if (groupFocusBar) groupFocusBar.style.width = avgFocus + '%';
        if (groupFocusScore) groupFocusScore.textContent = Math.round(avgFocus) + '%';
        if (groupPomodoroCount) groupPomodoroCount.textContent = this.currentRoom.stats.totalPomodoros;
        
        if (groupWorkTime) {
            const hours = Math.floor(this.currentRoom.stats.totalWorkTime / 3600);
            const minutes = Math.floor((this.currentRoom.stats.totalWorkTime % 3600) / 60);
            groupWorkTime.textContent = `${hours}h ${minutes}m`;
        }
    }
    
    async startSync() {
        // Sync every 3 seconds
        setInterval(async () => {
            if (this.currentRoom) {
                await this.syncRoom();
                await this.updateMyInfo();
            }
        }, 3000);
    }
    
    async syncRoom() {
        if (!this.currentRoom) return;
        
        try {
            const updatedRoom = await this.getRoomAPI(this.currentRoom.id);
            if (updatedRoom) {
                this.currentRoom = updatedRoom;
                this.renderRoom();
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
    
    async updateMyInfo() {
        if (!this.currentRoom) return;
        
        try {
            await this.updateRoomAPI(this.currentRoom.id, 'join', this.getMyInfo());
        } catch (error) {
            console.error('Update info error:', error);
        }
    }
    
    getMyInfo() {
        const emotionText = document.getElementById('emotionText')?.textContent || 'Unknown';
        const focusScore = window.productivityTracker?.focusScore || 50;
        const status = document.getElementById('myWorkStatus')?.value || 'available';
        
        return {
            id: this.myId,
            name: this.myName,
            emotion: emotionText,
            focusScore: focusScore,
            status: status,
            lastUpdate: Date.now()
        };
    }
    
    updateName(name) {
        this.myName = name;
        localStorage.setItem('cowork_username', name);
    }
    
    // ============= ROOMS LIST =============
    
    async loadRooms() {
        const roomsList = document.getElementById('roomsList');
        if (!roomsList) return;
        
        try {
            const rooms = await this.loadRoomsFromAPI();
            
            if (rooms.length === 0) {
                roomsList.innerHTML = '<p class="hint">Chưa có phòng nào. Tạo phòng đầu tiên!</p>';
                return;
            }
            
            roomsList.innerHTML = rooms.map(room => `
                <div class="room-item" onclick="window.coworkingSpace.joinRoom('${room.id}')">
                    <div class="room-name">${this.escapeHtml(room.name)}</div>
                    <div class="room-meta">${room.memberCount} 👥</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Load rooms error:', error);
            roomsList.innerHTML = '<p class="hint error">Lỗi tải danh sách phòng</p>';
        }
    }
    
    // ============= EXPORT REPORT =============
    
    exportRoomReport() {
        if (!this.currentRoom) return;
        window.shareManager?.exportCoworkingReport(this.currentRoom, this.myId);
    }
    
    // ============= UI HELPERS =============
    
    initUI() {
        // Same as original CoworkingSpace.initUI()
        const container = document.querySelector('.container');
        if (!container) return;
        
        const tabNav = document.querySelector('.tab-navigation');
        if (tabNav) {
            const coworkTab = document.createElement('button');
            coworkTab.className = 'tab-btn';
            coworkTab.setAttribute('data-tab', 'coworking');
            coworkTab.innerHTML = '👥 Co-working';
            coworkTab.onclick = () => this.showCoworkingTab();
            tabNav.appendChild(coworkTab);
        }
        
        const coworkDiv = document.createElement('div');
        coworkDiv.id = 'coworkingTab';
        coworkDiv.className = 'tab-content';
        coworkDiv.style.display = 'none';
        coworkDiv.innerHTML = this.getTabHTML();
        container.appendChild(coworkDiv);
    }
    
    getTabHTML() {
        // Same HTML as original - reuse from coworking-space.js
        return window.CoworkingSpace?.prototype?.getTabHTML?.call(this) || '<div>Loading...</div>';
    }
    
    showCoworkingTab() {
        if (typeof switchTab === 'function') {
            switchTab('coworking');
        }
        this.loadRooms();
    }
    
    showRoomActive() {
        const noRoom = document.getElementById('noRoomSelected');
        const roomActive = document.getElementById('roomActive');
        if (noRoom) noRoom.style.display = 'none';
        if (roomActive) roomActive.style.display = 'block';
    }
    
    showNoRoom() {
        const noRoom = document.getElementById('noRoomSelected');
        const roomActive = document.getElementById('roomActive');
        if (noRoom) noRoom.style.display = 'flex';
        if (roomActive) roomActive.style.display = 'none';
    }
    
    getStatusLabel(status) {
        const labels = {
            focus: '🎯 Tập trung',
            break: '☕ Nghỉ ngơi',
            available: '✅ Sẵn sàng',
            busy: '🔴 Bận'
        };
        return labels[status] || status;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'cowork-notification show';
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
    
    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not supported');
        }
    }
}

// Use production or development version
window.addEventListener('load', () => {
    // Check if we should use production API
    const useProductionAPI = window.location.protocol === 'https:' || 
                            window.location.hostname !== 'localhost';
    
    if (useProductionAPI && typeof CoworkingSpaceProduction !== 'undefined') {
        window.coworkingSpace = new CoworkingSpaceProduction();
        console.log('✅ CoworkingSpace (Production) initialized');
    } else if (typeof CoworkingSpace !== 'undefined') {
        window.coworkingSpace = new CoworkingSpace();
        console.log('✅ CoworkingSpace (Development) initialized');
    }
    
    // Check URL for room parameter
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId && window.coworkingSpace) {
        setTimeout(() => {
            window.coworkingSpace.joinRoom(roomId);
            if (typeof switchTab === 'function') {
                switchTab('coworking');
            }
        }, 1000);
    }
});
