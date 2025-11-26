// ============================================
// PROFESSIONAL EXPORT SERVICE
// Generate beautiful PDF reports with Vietnamese support
// ============================================

class ProfessionalExportService {
    constructor() {
        this.jsPDFLoaded = typeof window.jspdf !== 'undefined';
        
        if (!this.jsPDFLoaded) {
            console.warn('⚠️ jsPDF not loaded');
        } else {
            console.log('✅ Professional Export Service ready');
        }
        
        // Vietnamese emotion translations
        this.emotionTranslations = {
            'happy': 'Vui vẻ',
            'sad': 'Buồn',
            'angry': 'Tức giận',
            'surprised': 'Ngạc nhiên',
            'neutral': 'Bình thường',
            'fearful': 'Lo sợ',
            'disgusted': 'Khó chịu'
        };
        
        this.emotionEmojis = {
            'happy': '😊',
            'sad': '😢',
            'angry': '😠',
            'surprised': '😮',
            'neutral': '😐',
            'fearful': '😨',
            'disgusted': '🤢'
        };
    }

    // ============================================
    // FETCH REAL DATA FROM BACKEND
    // ============================================
    
    async fetchProductivityData() {
        try {
            // Check if user is authenticated
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                console.log('📊 Guest mode - using local data');
                return this.getLocalStorageData();
            }

            // Fetch from backend API
            const isLocal = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
            
            const baseURL = isLocal ? 'http://localhost:3000/api' : '/api';
            
            console.log('📊 Fetching productivity data from:', `${baseURL}/productivity/stats`);
            
            const response = await fetch(`${baseURL}/productivity/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.warn('⚠️ Failed to fetch from backend, using local data');
                return this.getLocalStorageData();
            }

            const result = await response.json();
            
            if (result.success && result.data) {
                console.log('✅ Fetched data from backend:', result.data);
                return result.data;
            } else {
                return this.getLocalStorageData();
            }
        } catch (error) {
            console.error('Error fetching productivity data:', error);
            console.log('📊 Falling back to local storage');
            return this.getLocalStorageData();
        }
    }

    getLocalStorageData() {
        // Get user info
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {
            id: 'guest',
            email: 'guest@local',
            full_name: 'Khách'
        };

        // Get tracker data if available
        if (window.productivityTracker) {
            const tracker = window.productivityTracker;
            const stats = tracker.getCurrentStats();
            
            // Calculate emotion distribution
            const emotionCounts = {};
            const emotionHistory = tracker.emotionHistory || [];
            
            emotionHistory.forEach(item => {
                const emotion = item.emotion || 'neutral';
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });

            return {
                totalWorkTime: stats.totalWorkTime || 0,
                totalBreakTime: stats.totalBreakTime || 0,
                focusedTime: stats.focusedTime || 0,
                distractedTime: stats.distractedTime || 0,
                stressTime: stats.stressTime || 0,
                happyTime: stats.happyTime || 0,
                averageFocusScore: tracker.focusScore || 0,
                pomodoroCompleted: tracker.pomodoroCompleted || 0,
                emotionHistory: emotionHistory,
                emotionDistribution: emotionCounts,
                totalEmotionRecords: emotionHistory.length,
                workSessions: tracker.workSessions || [],
                workNotes: tracker.workNotes || [],
                sessions: (tracker.workSessions || []).length,
                user: user
            };
        }

        // Fallback: Empty data for guest
        return {
            totalWorkTime: 0,
            focusedTime: 0,
            distractedTime: 0,
            totalBreakTime: 0,
            happyTime: 0,
            stressTime: 0,
            averageFocusScore: 0,
            pomodoroCompleted: 0,
            emotionDistribution: {},
            totalEmotionRecords: 0,
            emotionHistory: [],
            workSessions: [],
            workNotes: [],
            sessions: 0,
            user: user
        };
    }

    async exportToPDF(options = {}) {
        if (!this.jsPDFLoaded) {
            throw new Error('jsPDF chưa được tải');
        }

        // Fetch real data from backend or local storage
        console.log('📄 Starting PDF export...');
        const data = await this.fetchProductivityData();
        
        console.log('📊 Export data:', {
            user: data.user,
            totalWorkTime: data.totalWorkTime,
            emotionRecords: data.totalEmotionRecords,
            sessions: data.sessions
        });

        const {
            dateRange = 'Hôm nay'
        } = options;

        // Get user info from data
        const user = data.user || {
            id: 'guest',
            email: 'guest@local',
            full_name: 'Khách'
        };
        
        const userName = user.full_name || user.email || 'Người dùng';
        const userEmail = user.email || '';
        const userId = user.id || 'N/A';

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let y = 15;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        const contentWidth = pageWidth - 2 * margin;

        // ============================================
        // COMPANY HEADER
        // ============================================
        
        doc.setFillColor(102, 126, 234); // Purple gradient color
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('BAO CAO NANG SUAT LAM VIEC', pageWidth / 2, 15, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('He Thong Nhan Dien Cam Xuc & Quan Ly Hieu Suat', pageWidth / 2, 24, { align: 'center' });
        
        y = 45;

        // ============================================
        // REPORT INFO
        // ============================================
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        
        const now = new Date();
        const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        doc.text(`Nguoi dung: ${userName}`, margin, y);
        y += 5;
        doc.text(`Email: ${userEmail}`, margin, y);
        y += 5;
        doc.text(`ID: ${userId}`, margin, y);
        y += 5;
        doc.text(`Thoi gian: ${dateRange}`, margin, y);
        y += 5;
        doc.text(`Ngay xuat bao cao: ${dateStr} ${timeStr}`, margin, y);
        y += 12;

        // ============================================
        // EXECUTIVE SUMMARY BOX
        // ============================================
        
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(margin, y, contentWidth, 55, 3, 3, 'FD');
        
        y += 8;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('TONG QUAN', margin + 5, y);
        
        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);

        const totalHours = Math.floor((data.totalWorkTime || 0) / 3600);
        const totalMins = Math.floor(((data.totalWorkTime || 0) % 3600) / 60);
        const focusRate = this.calculateFocusRate(data);
        
        const summaryText = [
            `Tong thoi gian lam viec: ${totalHours}h ${totalMins}phut`,
            `Diem tap trung: ${Math.round(data.averageFocusScore || 0)}/100`,
            `Ti le tap trung: ${focusRate}%`,
            `Pomodoro hoan thanh: ${data.pomodoroCompleted || 0} phien`,
            `Cam xuc ghi nhan: ${Object.keys(data.emotionDistribution || {}).length} loai`
        ];

        summaryText.forEach(text => {
            doc.text(text, margin + 5, y);
            y += 6;
        });

        y += 8;

        // ============================================
        // DETAILED STATISTICS TABLE
        // ============================================
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('THONG KE CHI TIET', margin, y);
        y += 8;

        const statsData = [
            ['Tong thoi gian', this.formatTime(data.totalWorkTime || 0)],
            ['Thoi gian tap trung', this.formatTime(data.focusedTime || 0)],
            ['Thoi gian mat tap trung', this.formatTime(data.distractedTime || 0)],
            ['Thoi gian vui ve', this.formatTime(data.happyTime || 0)],
            ['Thoi gian cang thang', this.formatTime(data.stressTime || 0)],
            ['Thoi gian nghi', this.formatTime(data.totalBreakTime || 0)]
        ];

        doc.autoTable({
            startY: y,
            head: [['Chi so', 'Gia tri']],
            body: statsData,
            theme: 'striped',
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 5
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 70, fontStyle: 'bold' },
                1: { halign: 'right', cellWidth: 50 }
            },
            margin: { left: margin, right: margin }
        });

        y = doc.lastAutoTable.finalY + 12;

        // ============================================
        // EMOTION DISTRIBUTION
        // ============================================
        
        if (data.emotionDistribution && Object.keys(data.emotionDistribution).length > 0) {
            if (y > 240) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(142, 68, 173);
            doc.text('PHAN BO CAM XUC', margin, y);
            y += 8;

            const emotionData = Object.entries(data.emotionDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, count]) => {
                    const percentage = ((count / data.totalEmotionRecords) * 100).toFixed(1);
                    const emoji = this.emotionEmojis[emotion] || '🤖';
                    const translated = this.emotionTranslations[emotion] || emotion;
                    return [
                        `${emoji} ${translated}`,
                        count.toString(),
                        `${percentage}%`,
                        this.getEmotionBar(percentage)
                    ];
                });

            doc.autoTable({
                startY: y,
                head: [['Cam xuc', 'So lan', 'Ty le', 'Bieu do']],
                body: emotionData,
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 10,
                    cellPadding: 4
                },
                headStyles: {
                    fillColor: [142, 68, 173],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { halign: 'center', cellWidth: 30 },
                    2: { halign: 'center', cellWidth: 30 },
                    3: { cellWidth: 50 }
                },
                margin: { left: margin, right: margin }
            });

            y = doc.lastAutoTable.finalY + 12;
        }

        // ============================================
        // PRODUCTIVITY INSIGHTS
        // ============================================
        
        if (y > 220) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(230, 126, 34);
        doc.text('NHAN XET & DE XUAT', margin, y);
        y += 8;

        const insights = this.generateInsights(data);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);

        insights.forEach((insight, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}.`, margin, y);
            doc.setFont('helvetica', 'normal');
            
            const lines = doc.splitTextToSize(insight, contentWidth - 10);
            doc.text(lines, margin + 5, y);
            y += lines.length * 6 + 3;
        });

        // ============================================
        // EMOTION HISTORY TIMELINE (if available)
        // ============================================
        
        if (data.emotionHistory && data.emotionHistory.length > 0) {
            y += 10;
            
            if (y > 220) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(46, 204, 113);
            doc.text('LICH SU CAM XUC', margin, y);
            y += 8;

            // Show recent 10 emotions
            const recentEmotions = data.emotionHistory.slice(-10).map((record, index) => {
                const time = TIMEZONE_UTILS.toLocaleTimeString(record.timestamp || new Date());
                const emoji = this.emotionEmojis[record.emotion] || '🤖';
                const translated = this.emotionTranslations[record.emotion] || record.emotion;
                const confidence = (record.confidence * 100).toFixed(1);
                return [
                    (index + 1).toString(),
                    time,
                    `${emoji} ${translated}`,
                    `${confidence}%`,
                    `${record.focusScore || 0}/100`
                ];
            });

            doc.autoTable({
                startY: y,
                head: [['#', 'Thoi gian', 'Cam xuc', 'Do tin cay', 'Diem tap trung']],
                body: recentEmotions,
                theme: 'striped',
                styles: {
                    font: 'helvetica',
                    fontSize: 9,
                    cellPadding: 3
                },
                headStyles: {
                    fillColor: [46, 204, 113],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 15 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 50 },
                    3: { halign: 'center', cellWidth: 30 },
                    4: { halign: 'center', cellWidth: 35 }
                },
                margin: { left: margin, right: margin }
            });

            y = doc.lastAutoTable.finalY + 5;
        }

        // ============================================
        // FOOTER
        // ============================================
        
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(
                `Trang ${i} / ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
            doc.text(
                'Bao cao tu dong tao boi He Thong Nhan Dien Cam Xuc',
                pageWidth / 2,
                doc.internal.pageSize.height - 6,
                { align: 'center' }
            );
        }

        // ============================================
        // SAVE PDF
        // ============================================
        
        const filename = `BaoCao_NangSuat_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.pdf`;
        
        doc.save(filename);
        
        return {
            success: true,
            filename,
            pages: pageCount
        };
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}ph ${secs}s`;
        } else if (mins > 0) {
            return `${mins}ph ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    calculateFocusRate(data) {
        if (!data.totalWorkTime || data.totalWorkTime === 0) return '0.0';
        const rate = ((data.focusedTime || 0) / data.totalWorkTime) * 100;
        return rate.toFixed(1);
    }

    getEmotionBar(percentage) {
        const barLength = Math.round(parseFloat(percentage) / 10);
        return '█'.repeat(barLength) + '░'.repeat(10 - barLength);
    }

    generateInsights(data) {
        const insights = [];
        const focusRate = parseFloat(this.calculateFocusRate(data));
        const avgFocus = data.averageFocusScore || 0;
        const totalHours = (data.totalWorkTime || 0) / 3600;

        // Focus analysis
        if (focusRate >= 80) {
            insights.push('XUAT SAC! Ban co ti le tap trung rat cao. Day la muc hieu suat tuyet voi, hay tiep tuc duy tri.');
        } else if (focusRate >= 60) {
            insights.push('TOT! Ti le tap trung o muc tot. Co the cai thien them bang cach giam thieu yeu to gay rai ro.');
        } else if (focusRate >= 40) {
            insights.push('TRUNG BINH: Ti le tap trung can cai thien. Hay thu ky thuat Pomodoro de tang cuong kha nang tap trung.');
        } else {
            insights.push('CAN CHUYEN: Ti le tap trung thap. Hay tao moi truong lam viec yen tinh va han che cac yeu to gay rai ro.');
        }

        // Work time analysis
        if (totalHours > 8) {
            insights.push('CANH BAO: Thoi gian lam viec qua dai. Hay dam bao can bang giua cong viec va cuoc song de tranh kiet suc.');
        } else if (totalHours >= 6) {
            insights.push('TOT: Thoi gian lam viec hop ly va ben vung.');
        }

        // Pomodoro analysis
        const pomodoroRate = (data.pomodoroCompleted || 0) / (totalHours || 1);
        if (pomodoroRate < 1 && totalHours > 2) {
            insights.push('DE XUAT: Hay thu su dung ky thuat Pomodoro (25 phut tap trung + 5 phut nghi) de tang hieu suat.');
        }

        // Emotion analysis
        const emotionDist = data.emotionDistribution || {};
        const totalEmotions = data.totalEmotionRecords || 1;
        const happyRate = ((emotionDist.happy || 0) / totalEmotions) * 100;
        const stressRate = (((emotionDist.angry || 0) + (emotionDist.fearful || 0)) / totalEmotions) * 100;

        if (happyRate >= 50) {
            insights.push('TICH CUC: Ban co trang thai tinh than tot trong qua trinh lam viec. Rat tuyet!');
        }

        if (stressRate > 30) {
            insights.push('LUU Y: Phat hien muc do cang thang cao. Hay nghi ngoi thuong xuyen va thuc hien cac bai tap giam stress.');
        }

        // General recommendations
        if (avgFocus < 70) {
            insights.push('MOI TRUONG: Dam bao khong gian lam viec yen tinh, du anh sang va thoang mat de tang diem tap trung.');
        }

        return insights;
    }
}

// Initialize global instance
window.professionalExportService = new ProfessionalExportService();
console.log('✅ Professional Export Service initialized');
