/**
 * Universal Share Manager
 * Quản lý tất cả chức năng chia sẻ
 */

class ShareManager {
    constructor() {
        this.shareTypes = {
            emotion: 'Cảm xúc',
            productivity: 'Năng suất',
            snapshot: 'Ảnh chụp',
            coworking: 'Co-working',
            report: 'Báo cáo',
            achievement: 'Thành tích'
        };
    }
    
    // ============= SHARE EMOTION STATUS =============
    
    shareCurrentEmotion() {
        const emotion = document.getElementById('emotionText')?.textContent || 'Unknown';
        const confidence = document.getElementById('confidence')?.textContent || '0%';
        const focusScore = window.productivityTracker?.focusScore || 0;
        
        const text = `🎭 Cảm xúc hiện tại: ${emotion}\n📊 Độ chính xác: ${confidence}\n🎯 Tập trung: ${focusScore}/100\n\n#EmotionDetection #AI`;
        const url = window.location.href;
        
        this.shareContent({
            title: 'Cảm xúc của tôi',
            text: text,
            url: url
        });
    }
    
    // ============= SHARE PRODUCTIVITY REPORT =============
    
    shareProductivityReport() {
        const tracker = window.productivityTracker;
        if (!tracker) return;
        
        const workTime = this.formatTime(tracker.totalWorkTime);
        const pomodoroCount = tracker.pomodoroCount;
        const focusScore = tracker.focusScore;
        
        const text = `💼 Báo cáo năng suất:\n⏱️ Thời gian: ${workTime}\n🍅 Pomodoro: ${pomodoroCount}\n🎯 Tập trung: ${focusScore}/100\n\n#Productivity #Focus`;
        
        this.shareContent({
            title: 'Báo Cáo Năng Suất',
            text: text,
            url: window.location.href
        });
    }
    
    // ============= SHARE SNAPSHOT =============
    
    async shareSnapshot(snapshotId) {
        const gallery = window.snapshotGallery;
        if (!gallery) return;
        
        const snapshot = gallery.snapshots.find(s => s.id === snapshotId);
        if (!snapshot) return;
        
        try {
            // Convert base64 to blob
            const blob = await this.base64ToBlob(snapshot.image);
            const file = new File([blob], `emotion-${snapshot.emotion}-${snapshotId}.jpg`, { type: 'image/jpeg' });
            
            const shareData = {
                title: `Cảm xúc: ${snapshot.emotion}`,
                text: `🎭 ${snapshot.emotion} (${snapshot.confidence})\n📅 ${new Date(snapshot.timestamp).toLocaleString('vi-VN')}`,
                files: [file]
            };
            
            if (navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                this.showNotification('✅ Đã chia sẻ ảnh!');
            } else {
                // Fallback: download
                this.downloadImage(snapshot.image, `emotion-${snapshot.emotion}.jpg`);
            }
        } catch (err) {
            console.error('Share error:', err);
            this.downloadImage(snapshot.image, `emotion-${snapshot.emotion}.jpg`);
        }
    }
    
    // ============= EXPORT CO-WORKING REPORT =============
    
    async exportCoworkingReport(room, myId) {
        const reportData = {
            roomName: room.name,
            date: new Date().toLocaleDateString('vi-VN'),
            time: new Date().toLocaleTimeString('vi-VN'),
            members: room.members,
            stats: {
                totalMembers: room.members.length,
                avgFocusScore: this.calculateAvgFocus(room.members),
                totalPomodoros: room.stats.totalPomodoros,
                totalWorkTime: this.formatTime(room.stats.totalWorkTime)
            },
            goals: room.goals,
            chat: room.chat.slice(-20)
        };
        
        // Create HTML report
        const reportHTML = this.generateCoworkingReportHTML(reportData, myId);
        
        // Option 1: Download as HTML
        this.downloadHTML(reportHTML, `coworking-report-${Date.now()}.html`);
        
        // Option 2: Generate PDF (requires html2pdf.js)
        // this.generatePDF(reportHTML, `coworking-report-${Date.now()}.pdf`);
        
        this.showNotification('📊 Đã xuất báo cáo!');
    }
    
    generateCoworkingReportHTML(data, myId) {
        return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo Cáo Co-working - ${data.roomName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; margin-bottom: 10px; }
        .header { border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
        .meta { color: #7f8c8d; font-size: 14px; }
        .section { margin: 30px 0; }
        .section h2 { color: #34495e; margin-bottom: 15px; font-size: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; margin: 10px 0; }
        .stat-label { font-size: 14px; opacity: 0.9; }
        .members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
        .member-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; display: flex; align-items: center; gap: 15px; }
        .member-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; }
        .member-info { flex: 1; }
        .member-name { font-weight: bold; margin-bottom: 5px; }
        .member-stats { font-size: 13px; color: #666; }
        .goals-list { list-style: none; }
        .goal-item { padding: 12px; background: #f8f9fa; margin: 8px 0; border-radius: 6px; border-left: 4px solid #28a745; }
        .goal-item.completed { opacity: 0.6; text-decoration: line-through; }
        .chat-log { max-height: 400px; overflow-y: auto; background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .chat-message { margin: 8px 0; padding: 8px; background: white; border-radius: 6px; }
        .chat-meta { font-size: 12px; color: #999; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 13px; }
        @media print { body { background: white; padding: 0; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 ${data.roomName}</h1>
            <div class="meta">
                📅 ${data.date} • ⏰ ${data.time}
            </div>
        </div>
        
        <div class="section">
            <h2>📊 Thống Kê Tổng Quan</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Thành viên</div>
                    <div class="stat-value">${data.stats.totalMembers}</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <div class="stat-label">Điểm tập trung TB</div>
                    <div class="stat-value">${data.stats.avgFocusScore}</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    <div class="stat-label">Pomodoro</div>
                    <div class="stat-value">${data.stats.totalPomodoros}</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                    <div class="stat-label">Thời gian làm việc</div>
                    <div class="stat-value" style="font-size: 20px;">${data.stats.totalWorkTime}</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>👥 Danh Sách Thành Viên</h2>
            <div class="members-grid">
                ${data.members.map(member => `
                    <div class="member-card ${member.id === myId ? 'style="border-color: #3498db; border-width: 2px;"' : ''}">
                        <div class="member-avatar">${member.name.charAt(0).toUpperCase()}</div>
                        <div class="member-info">
                            <div class="member-name">${member.name} ${member.id === myId ? '(Bạn)' : ''}</div>
                            <div class="member-stats">
                                🎭 ${member.emotion} • 
                                🎯 ${member.focusScore}/100 • 
                                ${this.getStatusLabel(member.status)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>🎯 Mục Tiêu & Thành Tựu</h2>
            <ul class="goals-list">
                ${data.goals.length > 0 ? data.goals.map(goal => `
                    <li class="goal-item ${goal.completed ? 'completed' : ''}">
                        ${goal.completed ? '✅' : '⏳'} ${goal.goal}
                        <div class="chat-meta">${goal.userName}</div>
                    </li>
                `).join('') : '<li>Chưa có mục tiêu nào</li>'}
            </ul>
        </div>
        
        <div class="section">
            <h2>💬 Lịch Sử Chat</h2>
            <div class="chat-log">
                ${data.chat.map(msg => `
                    <div class="chat-message">
                        <div class="chat-meta">
                            <strong>${msg.userName || 'System'}</strong> • 
                            ${new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                        </div>
                        <div>${msg.content}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="footer">
            <p>📊 Báo cáo được tạo bởi AI Emotion Detection App</p>
            <p>🌐 ${window.location.href}</p>
        </div>
    </div>
</body>
</html>
        `;
    }
    
    // ============= EXPORT COMPLETE PRODUCTIVITY REPORT WITH IMAGES =============
    
    async exportFullReport() {
        const tracker = window.productivityTracker;
        const gallery = window.snapshotGallery;
        
        if (!tracker) {
            alert('Chưa có dữ liệu năng suất!');
            return;
        }
        
        const reportData = {
            date: new Date().toLocaleDateString('vi-VN'),
            time: new Date().toLocaleTimeString('vi-VN'),
            productivity: {
                workTime: this.formatTime(tracker.totalWorkTime),
                focusScore: tracker.focusScore,
                pomodoroCount: tracker.pomodoroCount,
                emotionStats: tracker.emotionStats
            },
            snapshots: gallery ? gallery.snapshots.slice(0, 10) : [],
            emotionHistory: tracker.emotionHistory.slice(-20)
        };
        
        const reportHTML = this.generateFullReportHTML(reportData);
        this.downloadHTML(reportHTML, `full-report-${Date.now()}.html`);
        
        this.showNotification('📊 Đã xuất báo cáo đầy đủ!');
    }
    
    generateFullReportHTML(data) {
        return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo Cáo Năng Suất & Cảm Xúc</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; font-size: 36px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; }
        .stat-value { font-size: 42px; font-weight: bold; margin: 10px 0; }
        .stat-label { font-size: 14px; opacity: 0.9; text-transform: uppercase; }
        .emotion-chart { margin: 30px 0; }
        .chart-bar { display: flex; align-items: center; margin: 10px 0; }
        .chart-label { width: 120px; font-weight: bold; }
        .chart-fill { height: 30px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border-radius: 4px; position: relative; }
        .chart-value { position: absolute; right: 10px; color: white; font-weight: bold; }
        .snapshots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .snapshot-item { border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .snapshot-item img { width: 100%; height: 200px; object-fit: cover; }
        .snapshot-info { padding: 10px; background: #f8f9fa; }
        .section { margin: 40px 0; }
        .section h2 { color: #34495e; margin-bottom: 20px; font-size: 24px; }
        @media print { body { background: white; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Báo Cáo Năng Suất & Cảm Xúc</h1>
        <div style="text-align: center; color: #7f8c8d; margin-bottom: 30px;">
            📅 ${data.date} • ⏰ ${data.time}
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Thời gian làm việc</div>
                <div class="stat-value" style="font-size: 28px;">${data.productivity.workTime}</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <div class="stat-label">Điểm tập trung</div>
                <div class="stat-value">${data.productivity.focusScore}</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <div class="stat-label">Pomodoro</div>
                <div class="stat-value">${data.productivity.pomodoroCount}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>🎭 Phân Tích Cảm Xúc</h2>
            <div class="emotion-chart">
                ${Object.entries(data.productivity.emotionStats).map(([emotion, count]) => {
                    const total = Object.values(data.productivity.emotionStats).reduce((a, b) => a + b, 0);
                    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                    return `
                        <div class="chart-bar">
                            <div class="chart-label">${emotion}</div>
                            <div class="chart-fill" style="width: ${percent}%">
                                <span class="chart-value">${count} (${percent}%)</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        ${data.snapshots.length > 0 ? `
            <div class="section">
                <h2>📸 Ảnh Chụp Cảm Xúc</h2>
                <div class="snapshots-grid">
                    ${data.snapshots.map(snap => `
                        <div class="snapshot-item">
                            <img src="${snap.image}" alt="${snap.emotion}" />
                            <div class="snapshot-info">
                                <strong>${snap.emotion}</strong><br>
                                <small>${snap.confidence}</small><br>
                                <small>${new Date(snap.timestamp).toLocaleString('vi-VN')}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <div style="margin-top: 50px; text-align: center; color: #999; font-size: 13px;">
            <p>📊 Báo cáo được tạo bởi AI Emotion Detection App</p>
            <p>🌐 ${window.location.href}</p>
        </div>
    </div>
</body>
</html>
        `;
    }
    
    // ============= SHARE TO SOCIAL MEDIA =============
    
    shareToTwitter(text) {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }
    
    shareToFacebook() {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }
    
    shareToLinkedIn(text) {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }
    
    // ============= HELPER FUNCTIONS =============
    
    async shareContent(data) {
        if (navigator.share) {
            try {
                await navigator.share(data);
                this.showNotification('✅ Đã chia sẻ!');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    this.fallbackShare(data);
                }
            }
        } else {
            this.fallbackShare(data);
        }
    }
    
    fallbackShare(data) {
        const text = `${data.title}\n\n${data.text}\n\n${data.url || ''}`;
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('📋 Đã copy vào clipboard!');
        });
    }
    
    async base64ToBlob(base64) {
        const response = await fetch(base64);
        return await response.blob();
    }
    
    downloadImage(base64, filename) {
        const link = document.createElement('a');
        link.href = base64;
        link.download = filename;
        link.click();
        this.showNotification('⬇️ Đang tải xuống...');
    }
    
    downloadHTML(html, filename) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
    
    calculateAvgFocus(members) {
        if (members.length === 0) return 0;
        const total = members.reduce((sum, m) => sum + (m.focusScore || 0), 0);
        return Math.round(total / members.length);
    }
    
    getStatusLabel(status) {
        const labels = {
            focus: '🎯 Tập trung',
            break: '☕ Nghỉ',
            available: '✅ Sẵn sàng',
            busy: '🔴 Bận'
        };
        return labels[status] || status;
    }
    
    showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'share-notification';
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
}

// Initialize
window.addEventListener('load', () => {
    window.shareManager = new ShareManager();
    console.log('✅ ShareManager initialized');
});
