/**
 * Virtual Co-working Space
 * Kết nối người dùng làm việc cùng nhau
 */

class CoworkingSpace {
    constructor() {
        this.currentRoom = null;
        this.peers = new Map();
        this.myId = this.generateUserId();
        this.myName = localStorage.getItem('cowork_username') || 'User' + Math.floor(Math.random() * 1000);
        this.sharedPomodoro = null;
        this.pomodoroInterval = null;
        
        // Simulate server with localStorage for demo
        // In production, use WebSocket/Firebase
        this.storageKey = 'coworking_rooms';
        
        this.initUI();
        this.startSync();
    }
    
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    initUI() {
        const container = document.querySelector('.container');
        
        // Add tab button
        const tabNav = document.querySelector('.tab-navigation');
        const coworkTab = document.createElement('button');
        coworkTab.className = 'tab-btn';
        coworkTab.setAttribute('data-tab', 'coworking');
        coworkTab.innerHTML = '👥 Co-working';
        coworkTab.onclick = () => this.showCoworkingTab();
        tabNav.appendChild(coworkTab);
        
        // Create tab content
        const coworkDiv = document.createElement('div');
        coworkDiv.id = 'coworkingTab';
        coworkDiv.className = 'tab-content';
        coworkDiv.style.display = 'none';
        coworkDiv.innerHTML = this.getTabHTML();
        container.appendChild(coworkDiv);
        
        console.log('✅ CoworkingSpace UI initialized');
    }
    
    getTabHTML() {
        return `
            <div class="coworking-layout">
                <!-- Sidebar -->
                <div class="coworking-sidebar">
                    <div class="section-card">
                        <h3>🚪 Phòng Làm Việc</h3>
                        <button onclick="window.coworkingSpace.createRoom()" class="btn-primary full-width">
                            ➕ Tạo Phòng Mới
                        </button>
                        <div id="roomsList" class="rooms-list"></div>
                    </div>
                    
                    <div class="section-card">
                        <h3>👤 Trạng Thái</h3>
                        <div class="my-status">
                            <input type="text" id="myUsername" placeholder="Tên của bạn" 
                                   value="${this.myName}" onchange="window.coworkingSpace.updateName(this.value)">
                            <select id="myWorkStatus" onchange="window.coworkingSpace.updateStatus(this.value)">
                                <option value="focus">🎯 Tập trung</option>
                                <option value="break">☕ Nghỉ ngơi</option>
                                <option value="available">✅ Sẵn sàng</option>
                                <option value="busy">🔴 Bận</option>
                            </select>
                            <div id="myCurrentEmotion" class="emotion-badge">😊 Happy</div>
                        </div>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="coworking-main">
                    <div id="noRoomSelected" class="no-room">
                        <div class="empty-state">
                            <div class="empty-icon">🏢</div>
                            <h2>Chưa chọn phòng</h2>
                            <p>Tạo phòng mới hoặc tham gia để bắt đầu!</p>
                        </div>
                    </div>
                    
                    <div id="roomActive" class="room-active" style="display: none;">
                        <!-- Room Header -->
                        <div class="room-header">
                            <div class="room-info">
                                <h2 id="roomName">Phòng Làm Việc</h2>
                                <span id="roomMemberCount">0 thành viên</span>
                            </div>
                            <div class="room-actions">
                                <button onclick="window.coworkingSpace.shareRoom()" class="btn-icon" title="Chia sẻ">🔗</button>
                                <button onclick="window.coworkingSpace.exportRoomReport()" class="btn-icon" title="Xuất báo cáo">📊</button>
                                <button onclick="window.coworkingSpace.leaveRoom()" class="btn-danger">🚪 Rời</button>
                            </div>
                        </div>
                        
                        <!-- Shared Pomodoro -->
                        <div class="section-card">
                            <h3>🍅 Pomodoro Chung</h3>
                            <div class="shared-pomodoro">
                                <div id="sharedTimer" class="timer-display">25:00</div>
                                <div id="pomodoroSession" class="session-info">Sẵn sàng</div>
                                <div class="pomodoro-controls">
                                    <button onclick="window.coworkingSpace.startSharedPomodoro()" id="pomodoroStartBtn">▶️</button>
                                    <button onclick="window.coworkingSpace.pauseSharedPomodoro()" id="pomodoroPauseBtn" disabled>⏸️</button>
                                    <button onclick="window.coworkingSpace.resetSharedPomodoro()">🔄</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Members Grid -->
                        <div class="section-card">
                            <h3>👥 Thành Viên (<span id="memberCount">0</span>)</h3>
                            <div id="membersGrid" class="members-grid"></div>
                        </div>
                        
                        <!-- Group Focus Stats -->
                        <div class="section-card">
                            <h3>📊 Thống Kê Nhóm</h3>
                            <div class="group-stats">
                                <div class="stat-item">
                                    <label>Điểm tập trung TB:</label>
                                    <div class="stat-bar">
                                        <div id="groupFocusBar" class="stat-fill" style="width: 0%"></div>
                                    </div>
                                    <span id="groupFocusScore">0%</span>
                                </div>
                                <div class="stat-item">
                                    <label>Pomodoro hoàn thành:</label>
                                    <span id="groupPomodoroCount" class="stat-value">0</span>
                                </div>
                                <div class="stat-item">
                                    <label>Thời gian làm việc:</label>
                                    <span id="groupWorkTime" class="stat-value">0h 0m</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Chat -->
                        <div class="section-card">
                            <h3>💬 Chat Nhóm</h3>
                            <div id="groupChat" class="group-chat"></div>
                            <div class="chat-input">
                                <input type="text" id="chatInput" placeholder="Nhập tin nhắn..." onkeypress="if(event.key==='Enter') window.coworkingSpace.sendMessage()">
                                <button onclick="window.coworkingSpace.sendMessage()">📤</button>
                            </div>
                        </div>
                        
                        <!-- Accountability -->
                        <div class="section-card">
                            <h3>🎯 Mục Tiêu & Trách Nhiệm</h3>
                            <div class="accountability-section">
                                <input type="text" id="myGoalInput" placeholder="Mục tiêu của bạn hôm nay...">
                                <button onclick="window.coworkingSpace.setGoal()">✅ Đặt mục tiêu</button>
                                <div id="goalsBoard" class="goals-board"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showCoworkingTab() {
        switchTab('coworking');
        this.loadRooms();
    }
    
    // ============= ROOM MANAGEMENT =============
    
    createRoom() {
        const roomName = prompt('Tên phòng:', 'Phòng Làm Việc ' + new Date().getHours() + 'h');
        if (!roomName) return;
        
        const room = {
            id: 'room_' + Date.now(),
            name: roomName,
            created: Date.now(),
            members: [this.getMyInfo()],
            pomodoro: {
                time: 1500, // 25 minutes
                isRunning: false,
                session: 'work'
            },
            chat: [],
            goals: [],
            stats: {
                totalPomodoros: 0,
                totalWorkTime: 0
            }
        };
        
        this.saveRoom(room);
        this.joinRoom(room.id);
    }
    
    joinRoom(roomId) {
        const rooms = this.loadRoomsData();
        const room = rooms.find(r => r.id === roomId);
        
        if (!room) {
            alert('Phòng không tồn tại!');
            return;
        }
        
        // Add myself if not already in room
        if (!room.members.find(m => m.id === this.myId)) {
            room.members.push(this.getMyInfo());
            this.saveRoom(room);
        }
        
        this.currentRoom = room;
        this.showRoomActive();
        this.renderRoom();
        this.broadcastMessage('system', `${this.myName} đã tham gia phòng`);
    }
    
    leaveRoom() {
        if (!this.currentRoom) return;
        
        const rooms = this.loadRoomsData();
        const room = rooms.find(r => r.id === this.currentRoom.id);
        
        if (room) {
            room.members = room.members.filter(m => m.id !== this.myId);
            this.saveRoom(room);
            this.broadcastMessage('system', `${this.myName} đã rời phòng`);
        }
        
        this.currentRoom = null;
        this.showNoRoom();
        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
        }
    }
    
    shareRoom() {
        if (!this.currentRoom) return;
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?room=${this.currentRoom.id}`;
        const shareText = `🏢 Tham gia phòng làm việc "${this.currentRoom.name}"!\n\n${shareUrl}`;
        
        if (navigator.share) {
            navigator.share({
                title: this.currentRoom.name,
                text: shareText,
                url: shareUrl
            }).then(() => {
                this.showNotification('✅ Đã chia sẻ phòng!');
            }).catch(err => console.log('Share cancelled'));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                this.showNotification('📋 Đã copy link phòng!');
            });
        }
    }
    
    // ============= SHARED POMODORO =============
    
    startSharedPomodoro() {
        if (!this.currentRoom) return;
        
        this.currentRoom.pomodoro.isRunning = true;
        this.saveRoom(this.currentRoom);
        
        document.getElementById('pomodoroStartBtn').disabled = true;
        document.getElementById('pomodoroPauseBtn').disabled = false;
        
        this.pomodoroInterval = setInterval(() => {
            this.updatePomodoroTimer();
        }, 1000);
        
        this.broadcastMessage('system', '🍅 Pomodoro đã bắt đầu!');
    }
    
    pauseSharedPomodoro() {
        if (!this.currentRoom) return;
        
        this.currentRoom.pomodoro.isRunning = false;
        this.saveRoom(this.currentRoom);
        
        document.getElementById('pomodoroStartBtn').disabled = false;
        document.getElementById('pomodoroPauseBtn').disabled = true;
        
        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
        }
        
        this.broadcastMessage('system', '⏸️ Pomodoro đã tạm dừng');
    }
    
    resetSharedPomodoro() {
        if (!this.currentRoom) return;
        
        this.currentRoom.pomodoro.time = 1500;
        this.currentRoom.pomodoro.isRunning = false;
        this.saveRoom(this.currentRoom);
        
        this.updatePomodoroDisplay();
        
        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
        }
        
        document.getElementById('pomodoroStartBtn').disabled = false;
        document.getElementById('pomodoroPauseBtn').disabled = true;
    }
    
    updatePomodoroTimer() {
        if (!this.currentRoom || !this.currentRoom.pomodoro.isRunning) return;
        
        this.currentRoom.pomodoro.time--;
        
        if (this.currentRoom.pomodoro.time <= 0) {
            this.pomodoroComplete();
            return;
        }
        
        this.saveRoom(this.currentRoom);
        this.updatePomodoroDisplay();
    }
    
    pomodoroComplete() {
        clearInterval(this.pomodoroInterval);
        
        this.currentRoom.stats.totalPomodoros++;
        
        // Switch session
        if (this.currentRoom.pomodoro.session === 'work') {
            this.currentRoom.pomodoro.session = 'break';
            this.currentRoom.pomodoro.time = 300; // 5 min break
            this.broadcastMessage('system', '🎉 Pomodoro hoàn thành! Nghỉ ngơi 5 phút!');
        } else {
            this.currentRoom.pomodoro.session = 'work';
            this.currentRoom.pomodoro.time = 1500; // 25 min work
            this.broadcastMessage('system', '💼 Bắt đầu phiên làm việc mới!');
        }
        
        this.currentRoom.pomodoro.isRunning = false;
        this.saveRoom(this.currentRoom);
        
        document.getElementById('pomodoroStartBtn').disabled = false;
        document.getElementById('pomodoroPauseBtn').disabled = true;
        
        this.updatePomodoroDisplay();
        this.playNotificationSound();
    }
    
    updatePomodoroDisplay() {
        const time = this.currentRoom?.pomodoro.time || 1500;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        
        document.getElementById('sharedTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const session = this.currentRoom?.pomodoro.session || 'work';
        document.getElementById('pomodoroSession').textContent = 
            session === 'work' ? '💼 Làm việc' : '☕ Nghỉ ngơi';
    }
    
    // ============= CHAT =============
    
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message || !this.currentRoom) return;
        
        this.broadcastMessage('user', message);
        input.value = '';
    }
    
    broadcastMessage(type, content) {
        if (!this.currentRoom) return;
        
        const message = {
            id: Date.now(),
            type: type,
            userId: this.myId,
            userName: this.myName,
            content: content,
            timestamp: new Date().toISOString()
        };
        
        this.currentRoom.chat.push(message);
        this.saveRoom(this.currentRoom);
        this.renderChat();
    }
    
    renderChat() {
        const chatDiv = document.getElementById('groupChat');
        if (!chatDiv || !this.currentRoom) return;
        
        const messages = this.currentRoom.chat.slice(-20); // Last 20 messages
        
        chatDiv.innerHTML = messages.map(msg => {
            if (msg.type === 'system') {
                return `<div class="chat-message system">${msg.content}</div>`;
            }
            
            const isMe = msg.userId === this.myId;
            return `
                <div class="chat-message ${isMe ? 'my-message' : 'peer-message'}">
                    <div class="message-header">
                        <strong>${msg.userName}</strong>
                        <span>${new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    <div class="message-content">${this.escapeHtml(msg.content)}</div>
                </div>
            `;
        }).join('');
        
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
    
    // ============= GOALS & ACCOUNTABILITY =============
    
    setGoal() {
        const input = document.getElementById('myGoalInput');
        const goal = input.value.trim();
        
        if (!goal || !this.currentRoom) return;
        
        const goalObj = {
            id: Date.now(),
            userId: this.myId,
            userName: this.myName,
            goal: goal,
            completed: false,
            timestamp: new Date().toISOString()
        };
        
        this.currentRoom.goals.push(goalObj);
        this.saveRoom(this.currentRoom);
        this.renderGoals();
        
        input.value = '';
        this.broadcastMessage('system', `🎯 ${this.myName} đã đặt mục tiêu mới!`);
    }
    
    toggleGoal(goalId) {
        if (!this.currentRoom) return;
        
        const goal = this.currentRoom.goals.find(g => g.id === goalId);
        if (goal && goal.userId === this.myId) {
            goal.completed = !goal.completed;
            this.saveRoom(this.currentRoom);
            this.renderGoals();
            
            if (goal.completed) {
                this.broadcastMessage('system', `✅ ${this.myName} đã hoàn thành mục tiêu!`);
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
                    <div class="goal-meta">${goal.userName}</div>
                </div>
            </div>
        `).join('');
    }
    
    // ============= MEMBERS & STATS =============
    
    renderRoom() {
        if (!this.currentRoom) return;
        
        document.getElementById('roomName').textContent = this.currentRoom.name;
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
        
        memberCount.textContent = members.length;
        roomMemberCount.textContent = `${members.length} thành viên`;
        
        membersGrid.innerHTML = members.map(member => {
            const isMe = member.id === this.myId;
            return `
                <div class="member-card ${isMe ? 'me' : ''}">
                    <div class="member-avatar">${member.name.charAt(0).toUpperCase()}</div>
                    <div class="member-info">
                        <div class="member-name">${member.name} ${isMe ? '(Bạn)' : ''}</div>
                        <div class="member-status ${member.status}">${this.getStatusLabel(member.status)}</div>
                        <div class="member-emotion">${member.emotion}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateGroupStats() {
        if (!this.currentRoom) return;
        
        const members = this.currentRoom.members;
        
        // Calculate average focus score
        const avgFocus = members.reduce((sum, m) => sum + (m.focusScore || 50), 0) / members.length;
        
        document.getElementById('groupFocusBar').style.width = avgFocus + '%';
        document.getElementById('groupFocusScore').textContent = Math.round(avgFocus) + '%';
        
        document.getElementById('groupPomodoroCount').textContent = this.currentRoom.stats.totalPomodoros;
        
        const hours = Math.floor(this.currentRoom.stats.totalWorkTime / 3600);
        const minutes = Math.floor((this.currentRoom.stats.totalWorkTime % 3600) / 60);
        document.getElementById('groupWorkTime').textContent = `${hours}h ${minutes}m`;
    }
    
    // ============= DATA SYNC =============
    
    startSync() {
        // Sync every 2 seconds
        setInterval(() => {
            if (this.currentRoom) {
                this.syncRoom();
                this.updateMyInfo();
            }
        }, 2000);
    }
    
    syncRoom() {
        const rooms = this.loadRoomsData();
        const updatedRoom = rooms.find(r => r.id === this.currentRoom.id);
        
        if (updatedRoom) {
            this.currentRoom = updatedRoom;
            this.renderRoom();
        }
    }
    
    updateMyInfo() {
        if (!this.currentRoom) return;
        
        const myInfo = this.getMyInfo();
        const memberIndex = this.currentRoom.members.findIndex(m => m.id === this.myId);
        
        if (memberIndex >= 0) {
            this.currentRoom.members[memberIndex] = myInfo;
            this.saveRoom(this.currentRoom);
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
    
    updateStatus(status) {
        // Status will be synced automatically
    }
    
    // ============= STORAGE =============
    
    loadRoomsData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }
    
    saveRoom(room) {
        const rooms = this.loadRoomsData();
        const index = rooms.findIndex(r => r.id === room.id);
        
        if (index >= 0) {
            rooms[index] = room;
        } else {
            rooms.push(room);
        }
        
        // Clean old rooms (older than 24 hours)
        const now = Date.now();
        const filtered = rooms.filter(r => now - r.created < 24 * 60 * 60 * 1000);
        
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }
    
    loadRooms() {
        const rooms = this.loadRoomsData();
        const roomsList = document.getElementById('roomsList');
        
        if (rooms.length === 0) {
            roomsList.innerHTML = '<p class="hint">Chưa có phòng nào. Tạo phòng đầu tiên!</p>';
            return;
        }
        
        roomsList.innerHTML = rooms.map(room => `
            <div class="room-item" onclick="window.coworkingSpace.joinRoom('${room.id}')">
                <div class="room-name">${room.name}</div>
                <div class="room-meta">${room.members.length} 👥</div>
            </div>
        `).join('');
    }
    
    // ============= UI HELPERS =============
    
    showRoomActive() {
        document.getElementById('noRoomSelected').style.display = 'none';
        document.getElementById('roomActive').style.display = 'block';
    }
    
    showNoRoom() {
        document.getElementById('noRoomSelected').style.display = 'flex';
        document.getElementById('roomActive').style.display = 'none';
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
        notif.className = 'cowork-notification';
        notif.textContent = message;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.classList.add('show'), 100);
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
    
    playNotificationSound() {
        // Simple beep sound using Web Audio API
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
    
    // ============= EXPORT REPORT =============
    
    exportRoomReport() {
        if (!this.currentRoom) return;
        
        window.shareManager.exportCoworkingReport(this.currentRoom, this.myId);
    }
}

// Initialize
window.addEventListener('load', () => {
    window.coworkingSpace = new CoworkingSpace();
    console.log('✅ CoworkingSpace initialized');
    
    // Check URL for room parameter
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId) {
        setTimeout(() => {
            window.coworkingSpace.joinRoom(roomId);
            switchTab('coworking');
        }, 1000);
    }
});
