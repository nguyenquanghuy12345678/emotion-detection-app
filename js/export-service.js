// ============================================
// EXPORT SERVICE - PDF & CSV REPORTS
// Generate professional reports from productivity data
// ============================================

class ExportService {
    constructor() {
        // Check if libraries are loaded
        // jsPDF UMD module exposes as window.jspdf (lowercase)
        this.jsPDFLoaded = typeof window.jspdf !== 'undefined';
        this.papaParseLoaded = typeof Papa !== 'undefined';
        
        if (!this.jsPDFLoaded) {
            console.warn('⚠️ jsPDF not loaded. PDF export will not work.');
            console.warn('Available globals:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')));
        } else {
            console.log('✅ jsPDF loaded successfully:', window.jspdf);
        }
        if (!this.papaParseLoaded) {
            console.warn('⚠️ PapaParse not loaded. CSV export will not work.');
        }
    }

    // ============================================
    // PDF EXPORT
    // ============================================

    async exportToPDF(data, options = {}) {
        if (!this.jsPDFLoaded) {
            throw new Error('jsPDF library not loaded');
        }

        const {
            title = 'Báo Cáo Năng Suất',
            userName = 'User',
            dateRange = 'Hôm nay',
            includeCharts = true,
            includeNotes = true
        } = options;

        // Initialize jsPDF - UMD module uses window.jspdf.jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let yPosition = 20;

        // ===== HEADER =====
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text(title, 105, yPosition, { align: 'center' });
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Người dùng: ${userName}`, 105, yPosition, { align: 'center' });
        yPosition += 5;
        doc.text(`Khoảng thời gian: ${dateRange}`, 105, yPosition, { align: 'center' });
        yPosition += 5;
        doc.text(`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`, 105, yPosition, { align: 'center' });
        yPosition += 15;

        // ===== LINE SEPARATOR =====
        doc.setDrawColor(200);
        doc.line(10, yPosition, 200, yPosition);
        yPosition += 10;

        // ===== SUMMARY STATISTICS =====
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('📊 Tổng Quan Thống Kê', 10, yPosition);
        yPosition += 8;

        const summaryData = [
            ['Tổng thời gian làm việc', this.formatTime(data.totalWorkTime || 0)],
            ['Thời gian tập trung', this.formatTime(data.focusedTime || 0)],
            ['Thời gian mất tập trung', this.formatTime(data.distractedTime || 0)],
            ['Điểm tập trung trung bình', `${Math.round(data.averageFocusScore || 0)}/100`],
            ['Pomodoro hoàn thành', `${data.pomodoroCompleted || 0} phiên`],
            ['Tỷ lệ tập trung', `${this.calculateFocusRate(data)}%`]
        ];

        doc.autoTable({
            startY: yPosition,
            head: [['Chỉ số', 'Giá trị']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [76, 175, 80] },
            styles: { fontSize: 10, font: 'helvetica' },
            margin: { left: 10, right: 10 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;

        // ===== EMOTION DISTRIBUTION =====
        if (data.emotionDistribution && Object.keys(data.emotionDistribution).length > 0) {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('🎭 Phân Bố Cảm Xúc', 10, yPosition);
            yPosition += 8;

            const emotionData = Object.entries(data.emotionDistribution).map(([emotion, count]) => {
                const percentage = ((count / data.totalEmotionRecords) * 100).toFixed(1);
                return [
                    this.getEmotionEmoji(emotion) + ' ' + this.translateEmotion(emotion),
                    count,
                    `${percentage}%`
                ];
            });

            doc.autoTable({
                startY: yPosition,
                head: [['Cảm xúc', 'Số lần', 'Tỷ lệ']],
                body: emotionData,
                theme: 'striped',
                headStyles: { fillColor: [33, 150, 243] },
                styles: { fontSize: 10 },
                margin: { left: 10, right: 10 }
            });

            yPosition = doc.lastAutoTable.finalY + 15;
        }

        // ===== SESSION DETAILS =====
        if (data.sessions && data.sessions.length > 0) {
            if (yPosition > 240) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('⏱️ Chi Tiết Phiên Làm Việc', 10, yPosition);
            yPosition += 8;

            const sessionData = data.sessions.map((session, index) => [
                `#${index + 1}`,
                new Date(session.startTime).toLocaleString('vi-VN'),
                this.formatTime(session.duration || 0),
                `${Math.round(session.focusScore || 0)}/100`,
                `${session.pomodoroCount || 0}`
            ]);

            doc.autoTable({
                startY: yPosition,
                head: [['Phiên', 'Thời gian bắt đầu', 'Thời lượng', 'Điểm tập trung', 'Pomodoros']],
                body: sessionData,
                theme: 'grid',
                headStyles: { fillColor: [255, 152, 0] },
                styles: { fontSize: 9 },
                margin: { left: 10, right: 10 }
            });

            yPosition = doc.lastAutoTable.finalY + 15;
        }

        // ===== WORK NOTES =====
        if (includeNotes && data.notes && data.notes.length > 0) {
            if (yPosition > 240) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('📝 Ghi Chú Công Việc', 10, yPosition);
            yPosition += 8;

            const notesData = data.notes.slice(0, 10).map((note, index) => [
                new Date(note.timestamp || note.created_at).toLocaleString('vi-VN'),
                note.note_text || note.text || '',
                `${Math.round(note.focus_score || 0)}/100`
            ]);

            doc.autoTable({
                startY: yPosition,
                head: [['Thời gian', 'Ghi chú', 'Tập trung']],
                body: notesData,
                theme: 'plain',
                headStyles: { fillColor: [156, 39, 176] },
                styles: { fontSize: 9, cellPadding: 3 },
                margin: { left: 10, right: 10 },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 120 },
                    2: { cellWidth: 25 }
                }
            });

            yPosition = doc.lastAutoTable.finalY + 15;
        }

        // ===== RECOMMENDATIONS =====
        const recommendations = this.generateRecommendations(data);
        if (recommendations.length > 0) {
            if (yPosition > 240) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('💡 Gợi Ý Cải Thiện', 10, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            recommendations.forEach((rec, index) => {
                if (yPosition > 280) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(`${index + 1}. ${rec}`, 15, yPosition);
                yPosition += 7;
            });
        }

        // ===== FOOTER ON LAST PAGE =====
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Trang ${i} / ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
            doc.text(
                'Generated by Emotion Detection & Productivity Tracker',
                105,
                doc.internal.pageSize.getHeight() - 5,
                { align: 'center' }
            );
        }

        // ===== SAVE FILE =====
        const fileName = `productivity-report-${new Date().getTime()}.pdf`;
        doc.save(fileName);

        return {
            success: true,
            fileName,
            message: 'PDF exported successfully'
        };
    }

    // ============================================
    // CSV EXPORT
    // ============================================

    async exportToCSV(data, options = {}) {
        if (!this.papaParseLoaded) {
            // Fallback to manual CSV generation
            return this.exportToCSVManual(data, options);
        }

        const {
            type = 'summary', // 'summary', 'emotions', 'sessions', 'notes'
            fileName = `export-${type}-${Date.now()}.csv`
        } = options;

        let csvData = [];
        let headers = [];

        switch (type) {
            case 'summary':
                headers = ['Metric', 'Value'];
                csvData = [
                    ['Total Work Time', this.formatTime(data.totalWorkTime || 0)],
                    ['Focused Time', this.formatTime(data.focusedTime || 0)],
                    ['Distracted Time', this.formatTime(data.distractedTime || 0)],
                    ['Average Focus Score', Math.round(data.averageFocusScore || 0)],
                    ['Pomodoro Completed', data.pomodoroCompleted || 0],
                    ['Focus Rate', this.calculateFocusRate(data) + '%']
                ];
                break;

            case 'emotions':
                headers = ['Timestamp', 'Emotion', 'Confidence', 'Focus Score'];
                csvData = (data.emotionHistory || []).map(item => [
                    new Date(item.timestamp).toISOString(),
                    item.emotion,
                    item.confidence,
                    item.focus_score || item.focusScore || 0
                ]);
                break;

            case 'sessions':
                headers = ['Session ID', 'Start Time', 'End Time', 'Duration (sec)', 'Focus Score', 'Pomodoros'];
                csvData = (data.sessions || []).map(session => [
                    session.id,
                    new Date(session.start_time || session.startTime).toISOString(),
                    session.end_time ? new Date(session.end_time).toISOString() : 'Ongoing',
                    session.duration_seconds || session.duration || 0,
                    session.focus_score || session.focusScore || 0,
                    session.pomodoro_count || session.pomodoroCount || 0
                ]);
                break;

            case 'notes':
                headers = ['Timestamp', 'Note', 'Emotion', 'Focus Score'];
                csvData = (data.notes || []).map(note => [
                    new Date(note.created_at || note.timestamp).toISOString(),
                    note.note_text || note.text || '',
                    note.emotion || '',
                    note.focus_score || note.focusScore || 0
                ]);
                break;

            default:
                throw new Error('Invalid export type');
        }

        // Generate CSV using PapaParse
        const csv = Papa.unparse({
            fields: headers,
            data: csvData
        });

        // Download file
        this.downloadCSV(csv, fileName);

        return {
            success: true,
            fileName,
            message: 'CSV exported successfully'
        };
    }

    exportToCSVManual(data, options = {}) {
        const {
            type = 'summary',
            fileName = `export-${type}-${Date.now()}.csv`
        } = options;

        let csv = '';

        if (type === 'summary') {
            csv = 'Metric,Value\n';
            csv += `Total Work Time,${this.formatTime(data.totalWorkTime || 0)}\n`;
            csv += `Focused Time,${this.formatTime(data.focusedTime || 0)}\n`;
            csv += `Distracted Time,${this.formatTime(data.distractedTime || 0)}\n`;
            csv += `Average Focus Score,${Math.round(data.averageFocusScore || 0)}\n`;
            csv += `Pomodoro Completed,${data.pomodoroCompleted || 0}\n`;
            csv += `Focus Rate,${this.calculateFocusRate(data)}%\n`;
        }

        this.downloadCSV(csv, fileName);

        return {
            success: true,
            fileName,
            message: 'CSV exported successfully'
        };
    }

    downloadCSV(csvContent, fileName) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    // ============================================
    // EXPORT ALL (ZIP) - Future Enhancement
    // ============================================

    async exportAll(data, options = {}) {
        // Export both PDF and CSV
        const pdfResult = await this.exportToPDF(data, options);
        const csvResult = await this.exportToCSV(data, { ...options, type: 'summary' });

        return {
            success: true,
            files: [pdfResult.fileName, csvResult.fileName],
            message: 'All data exported successfully'
        };
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    calculateFocusRate(data) {
        const total = data.totalWorkTime || 0;
        const focused = data.focusedTime || 0;
        
        if (total === 0) return 0;
        return ((focused / total) * 100).toFixed(1);
    }

    getEmotionEmoji(emotion) {
        const emojiMap = {
            'happy': '😊',
            'sad': '😢',
            'angry': '😠',
            'surprised': '😮',
            'neutral': '😐',
            'fearful': '😨',
            'disgusted': '🤢'
        };
        return emojiMap[emotion] || '🤖';
    }

    translateEmotion(emotion) {
        const translations = {
            'happy': 'Vui vẻ',
            'sad': 'Buồn',
            'angry': 'Tức giận',
            'surprised': 'Ngạc nhiên',
            'neutral': 'Bình thường',
            'fearful': 'Lo sợ',
            'disgusted': 'Khó chịu'
        };
        return translations[emotion] || emotion;
    }

    generateRecommendations(data) {
        const recommendations = [];
        const focusRate = parseFloat(this.calculateFocusRate(data));
        const avgFocusScore = data.averageFocusScore || 0;

        if (focusRate < 50) {
            recommendations.push('Tỷ lệ tập trung thấp. Hãy thử kỹ thuật Pomodoro để cải thiện.');
        }

        if (avgFocusScore < 60) {
            recommendations.push('Điểm tập trung trung bình thấp. Hãy giảm thiểu yếu tố gây mất tập trung.');
        }

        if ((data.pomodoroCompleted || 0) < 4) {
            recommendations.push('Hãy thử hoàn thành ít nhất 4 Pomodoro mỗi ngày để tăng năng suất.');
        }

        if (data.stressTime > data.totalWorkTime * 0.3) {
            recommendations.push('Thời gian căng thẳng cao. Hãy nghỉ ngơi nhiều hơn và thực hiện bài tập thở.');
        }

        if ((data.totalWorkTime || 0) > 8 * 3600) {
            recommendations.push('Thời gian làm việc quá dài. Hãy chú ý đến sức khỏe và cân bằng công việc-cuộc sống.');
        }

        if (recommendations.length === 0) {
            recommendations.push('Tuyệt vời! Bạn đang làm việc rất hiệu quả. Hãy duy trì!');
        }

        return recommendations;
    }

    // ============================================
    // PREPARE DATA FOR EXPORT
    // ============================================

    prepareExportData(productivityTracker, dateRange = 'today') {
        // Gather all data from productivity tracker
        const data = {
            totalWorkTime: productivityTracker.stats.totalWorkTime || 0,
            totalBreakTime: productivityTracker.stats.totalBreakTime || 0,
            focusedTime: productivityTracker.stats.focusedTime || 0,
            distractedTime: productivityTracker.stats.distractedTime || 0,
            stressTime: productivityTracker.stats.stressTime || 0,
            happyTime: productivityTracker.stats.happyTime || 0,
            averageFocusScore: productivityTracker.focusScore || 0,
            pomodoroCompleted: productivityTracker.pomodoroCount || 0,
            emotionHistory: productivityTracker.emotionHistory || [],
            sessions: productivityTracker.workSessions || [],
            notes: productivityTracker.workNotes || [],
            emotionDistribution: {},
            totalEmotionRecords: 0
        };

        // Calculate emotion distribution
        const emotionCounts = {};
        data.emotionHistory.forEach(item => {
            emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
        });

        data.emotionDistribution = emotionCounts;
        data.totalEmotionRecords = data.emotionHistory.length;

        return data;
    }
}

// Export service instance
window.exportService = new ExportService();
console.log('✅ Export Service initialized');
