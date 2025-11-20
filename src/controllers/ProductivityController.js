/**
 * ProductivityController - Điều khiển productivity tracking
 */
import { Session } from '../models/Session.js';
import { ProductivityStats } from '../models/ProductivityStats.js';
import { ProductivityView } from '../views/ProductivityView.js';

export class ProductivityController {
    constructor(apiService) {
        this.apiService = apiService;
        this.view = new ProductivityView();
        
        this.currentSession = null;
        this.stats = new ProductivityStats();
        this.notes = [];
        
        // Pomodoro timer
        this.pomodoroSeconds = 25 * 60;
        this.breakSeconds = 5 * 60;
        this.currentSeconds = this.pomodoroSeconds;
        this.isWorkTime = true;
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateView();
    }

    bindEvents() {
        // Start session
        const startBtn = document.getElementById('startSessionBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startSession());
        }

        // End session
        const endBtn = document.getElementById('endSessionBtn');
        if (endBtn) {
            endBtn.addEventListener('click', () => this.endSession());
        }

        // Start Pomodoro
        const pomodoroBtn = document.getElementById('startPomodoroBtn');
        if (pomodoroBtn) {
            pomodoroBtn.addEventListener('click', () => this.startPomodoro());
        }

        // Add note
        const addNoteBtn = document.getElementById('addNoteBtn');
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => this.addNote());
        }

        // Export
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.export());
        }
    }

    /**
     * Bắt đầu session làm việc
     */
    async startSession() {
        if (this.currentSession && this.currentSession.isActive) {
            console.warn('Session already active');
            return;
        }

        this.currentSession = new Session();
        this.currentSession.start();
        
        this.view.showSessionStatus('Đã bắt đầu làm việc!', 'success');
        
        // Save to API if authenticated
        if (this.apiService && this.apiService.isAuthenticated()) {
            try {
                const result = await this.apiService.startSession();
                this.currentSession.id = result.sessionId;
            } catch (error) {
                console.error('Failed to start session:', error);
            }
        }

        console.log('✅ Session started');
    }

    /**
     * Kết thúc session
     */
    async endSession() {
        if (!this.currentSession || !this.currentSession.isActive) {
            console.warn('No active session');
            return;
        }

        this.currentSession.end();
        this.stats.incrementSession();
        
        this.view.showSessionStatus('Đã kết thúc session!', 'info');
        
        // Save to API if authenticated
        if (this.apiService && this.apiService.isAuthenticated() && this.currentSession.id) {
            try {
                await this.apiService.endSession(this.currentSession.id, {
                    duration: this.currentSession.duration,
                    emotions: this.currentSession.emotions,
                    notes: this.currentSession.notes
                });
            } catch (error) {
                console.error('Failed to end session:', error);
            }
        }

        this.updateView();
        console.log('✅ Session ended');
    }

    /**
     * Bắt đầu Pomodoro timer
     */
    startPomodoro() {
        if (this.timerInterval) {
            this.stopPomodoro();
            return;
        }

        this.currentSeconds = this.isWorkTime ? this.pomodoroSeconds : this.breakSeconds;
        
        this.timerInterval = setInterval(() => {
            this.currentSeconds--;
            
            this.view.updateTimer(this.currentSeconds, this.isWorkTime);
            
            if (this.currentSeconds <= 0) {
                this.handlePomodoroComplete();
            }
        }, 1000);

        this.view.showSessionStatus(
            this.isWorkTime ? '⏰ Pomodoro bắt đầu!' : '☕ Nghỉ ngơi!',
            'success'
        );
    }

    /**
     * Dừng Pomodoro
     */
    stopPomodoro() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Xử lý khi Pomodoro hoàn thành
     */
    handlePomodoroComplete() {
        this.stopPomodoro();
        
        if (this.isWorkTime) {
            this.stats.incrementPomodoro();
            this.stats.addBreakTime(this.breakSeconds * 1000);
            this.view.showSessionStatus('✅ Pomodoro hoàn thành! Nghỉ ngơi 5 phút!', 'success');
        } else {
            this.view.showSessionStatus('✅ Đã nghỉ ngơi! Tiếp tục làm việc!', 'success');
        }

        this.isWorkTime = !this.isWorkTime;
        this.updateView();
    }

    /**
     * Thêm ghi chú
     */
    async addNote() {
        const noteInput = document.getElementById('noteInput');
        if (!noteInput) return;

        const content = noteInput.value.trim();
        if (!content) return;

        const note = {
            timestamp: Date.now(),
            content: content
        };

        this.notes.push(note);
        
        if (this.currentSession) {
            this.currentSession.addNote(content);
        }

        // Save to API
        if (this.apiService && this.apiService.isAuthenticated()) {
            try {
                await this.apiService.saveNote({
                    content: content,
                    sessionId: this.currentSession?.id
                });
            } catch (error) {
                console.error('Failed to save note:', error);
            }
        }

        noteInput.value = '';
        this.view.showSessionStatus('📝 Đã lưu ghi chú!', 'success');
    }

    /**
     * Cập nhật stats từ emotion
     */
    updateStatsFromEmotion(emotion) {
        this.stats.updateFromEmotion(emotion, 1000);
        
        if (this.currentSession) {
            this.currentSession.addEmotion(emotion);
        }

        this.updateView();
    }

    /**
     * Cập nhật view
     */
    updateView() {
        this.view.updateStats(this.stats);
    }

    /**
     * Export dữ liệu
     */
    async export() {
        const { ExportService } = await import('../services/ExportService.js');
        const exportService = new ExportService();

        try {
            const emotions = this.currentSession?.emotions || [];
            await exportService.exportPDF(this.stats, emotions, this.notes);
            this.view.showSessionStatus('✅ Đã export PDF!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.view.showSessionStatus('❌ Export thất bại!', 'error');
        }
    }

    /**
     * Lấy stats
     */
    getStats() {
        return this.stats;
    }
}
