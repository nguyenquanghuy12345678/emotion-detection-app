class ProductivityTracker {
    constructor() {
        this.workTime = 0;
        this.breakTime = 0;
        this.tasks = [];
        this.pomodoroTimer = null;
        this.pomodoroState = 'stopped'; // stopped, work, break
        this.pomodoroTimeLeft = 25 * 60; // 25 minutes in seconds
        this.pomodoroRounds = 0;
        
        this.init();
    }

    init() {
        try {
            console.log('💼 ProductivityTracker initializing...');
            this.setupEventListeners();
            this.loadData();
            this.updateUI();
            console.log('✅ ProductivityTracker ready');
        } catch (error) {
            console.error('ProductivityTracker initialization error:', error);
        }
    }

    setupEventListeners() {
        // Pomodoro controls
        const startPomodoro = document.getElementById('startPomodoro');
        const pausePomodoro = document.getElementById('pausePomodoro');
        const resetPomodoro = document.getElementById('resetPomodoro');

        if (startPomodoro) {
            startPomodoro.addEventListener('click', () => this.startPomodoro());
        }

        if (pausePomodoro) {
            pausePomodoro.addEventListener('click', () => this.pausePomodoro());
        }

        if (resetPomodoro) {
            resetPomodoro.addEventListener('click', () => this.resetPomodoro());
        }

        // Task management
        const addTask = document.getElementById('addTask');
        const taskInput = document.getElementById('taskInput');

        if (addTask) {
            addTask.addEventListener('click', () => this.addTask());
        }

        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTask();
                }
            });
        }
    }

    // Pomodoro functionality
    startPomodoro() {
        if (this.pomodoroState === 'stopped' || this.pomodoroState === 'paused') {
            this.pomodoroState = 'work';
            this.pomodoroTimer = setInterval(() => this.updatePomodoro(), 1000);
            this.updatePomodoroStatus('🍅 Đang làm việc - tập trung!');
        }
    }

    pausePomodoro() {
        if (this.pomodoroState === 'work' || this.pomodoroState === 'break') {
            this.pomodoroState = 'paused';
            clearInterval(this.pomodoroTimer);
            this.updatePomodoroStatus('⏸️ Đã tạm dừng');
        }
    }

    resetPomodoro() {
        this.pomodoroState = 'stopped';
        clearInterval(this.pomodoroTimer);
        this.pomodoroTimeLeft = 25 * 60;
        this.updatePomodoroDisplay();
        this.updatePomodoroStatus('Sẵn sàng làm việc!');
    }

    updatePomodoro() {
        this.pomodoroTimeLeft--;

        if (this.pomodoroTimeLeft <= 0) {
            if (this.pomodoroState === 'work') {
                // Work session completed
                this.pomodoroRounds++;
                this.workTime += 25; // Add 25 minutes

                if (this.pomodoroRounds % 4 === 0) {
                    // Long break after 4 rounds
                    this.pomodoroTimeLeft = 15 * 60; // 15 minutes
                    this.pomodoroState = 'break';
                    this.updatePomodoroStatus('🎉 Nghỉ dài 15 phút!');
                } else {
                    // Short break
                    this.pomodoroTimeLeft = 5 * 60; // 5 minutes
                    this.pomodoroState = 'break';
                    this.updatePomodoroStatus('☕ Nghỉ ngơi 5 phút!');
                }
            } else {
                // Break completed
                this.breakTime += this.pomodoroState === 'break' ? 5 : 15;
                this.pomodoroTimeLeft = 25 * 60; // Back to work
                this.pomodoroState = 'work';
                this.updatePomodoroStatus('💪 Quay lại làm việc!');
            }
        }

        this.updatePomodoroDisplay();
        this.updateWorkStats();
    }

    updatePomodoroDisplay() {
        const timer = document.getElementById('pomodoroTimer');
        if (timer) {
            const minutes = Math.floor(this.pomodoroTimeLeft / 60);
            const seconds = this.pomodoroTimeLeft % 60;
            timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updatePomodoroStatus(status) {
        const statusEl = document.getElementById('pomodoroStatus');
        if (statusEl) {
            statusEl.textContent = status;
        }
    }

    // Task management
    addTask() {
        const input = document.getElementById('taskInput');
        if (!input || !input.value.trim()) return;

        const task = {
            id: Date.now(),
            text: input.value.trim(),
            completed: false,
            createdAt: new Date()
        };

        this.tasks.push(task);
        input.value = '';
        this.updateTaskList();
        this.saveData();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date() : null;
            this.updateTaskList();
            this.saveData();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.updateTaskList();
        this.saveData();
    }

    updateTaskList() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;

        if (this.tasks.length === 0) {
            taskList.innerHTML = '<div class="no-tasks">Chưa có nhiệm vụ nào. Hãy thêm nhiệm vụ đầu tiên!</div>';
            return;
        }

        taskList.innerHTML = this.tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" 
                       ${task.completed ? 'checked' : ''} 
                       onchange="window.productivityTracker.toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
                <button class="task-delete" onclick="window.productivityTracker.deleteTask(${task.id})">🗑️</button>
            </div>
        `).join('');
    }

    updateWorkStats() {
        // Update work time display
        const workTimeEl = document.getElementById('workTime');
        if (workTimeEl) {
            const hours = Math.floor(this.workTime / 60);
            const minutes = this.workTime % 60;
            workTimeEl.textContent = `${hours}h ${minutes}m`;
        }

        // Update break time display
        const breakTimeEl = document.getElementById('breakTime');
        if (breakTimeEl) {
            const hours = Math.floor(this.breakTime / 60);
            const minutes = this.breakTime % 60;
            breakTimeEl.textContent = `${hours}h ${minutes}m`;
        }

        // Update productivity score
        const productivityEl = document.getElementById('productivityScore');
        if (productivityEl) {
            const completedTasks = this.tasks.filter(t => t.completed).length;
            const totalTasks = this.tasks.length;
            const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const timeScore = this.workTime > 0 ? Math.min((this.workTime / 480) * 100, 100) : 0; // 8 hours = 100%
            const overallScore = Math.round((taskScore + timeScore) / 2);
            productivityEl.textContent = `${overallScore}%`;
        }

        // Update focus level
        const focusEl = document.getElementById('focusLevel');
        if (focusEl) {
            const focusLevels = ['Thấp', 'Trung bình', 'Cao', 'Xuất sắc'];
            const focusIndex = Math.min(Math.floor(this.pomodoroRounds / 2), 3);
            focusEl.textContent = focusLevels[focusIndex];
        }
    }

    updateUI() {
        this.updatePomodoroDisplay();
        this.updateTaskList();
        this.updateWorkStats();
    }

    // Data persistence
    saveData() {
        try {
            const data = {
                workTime: this.workTime,
                breakTime: this.breakTime,
                tasks: this.tasks,
                pomodoroRounds: this.pomodoroRounds,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem('productivityData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving productivity data:', error);
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('productivityData');
            if (saved) {
                const data = JSON.parse(saved);
                this.workTime = data.workTime || 0;
                this.breakTime = data.breakTime || 0;
                this.tasks = data.tasks || [];
                this.pomodoroRounds = data.pomodoroRounds || 0;
            }
        } catch (error) {
            console.error('Error loading productivity data:', error);
        }
    }

    // Get analytics data
    getProductivityStats() {
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        
        return {
            workTime: this.workTime,
            breakTime: this.breakTime,
            pomodoroRounds: this.pomodoroRounds,
            completedTasks,
            totalTasks,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            productivityScore: this.calculateProductivityScore()
        };
    }

    calculateProductivityScore() {
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const timeScore = this.workTime > 0 ? Math.min((this.workTime / 480) * 100, 100) : 0;
        
        return Math.round((taskScore + timeScore) / 2);
    }

    // Export functionality
    exportData() {
        const data = {
            productivity: this.getProductivityStats(),
            tasks: this.tasks,
            emotions: window.emotionApp?.emotionHandler?.getEmotionHistory() || [],
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `productivity-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    reset() {
        if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu productivity?')) {
            this.workTime = 0;
            this.breakTime = 0;
            this.tasks = [];
            this.pomodoroRounds = 0;
            this.resetPomodoro();
            this.updateUI();
            this.saveData();
        }
    }
}

// Initialize ProductivityTracker
document.addEventListener('DOMContentLoaded', () => {
    // Ensure no duplicate instances
    if (!window.productivityTracker) {
        window.productivityTracker = new ProductivityTracker();
    }
});