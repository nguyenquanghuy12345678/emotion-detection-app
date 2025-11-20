/**
 * ExportService - Export dữ liệu ra PDF/CSV
 */
export class ExportService {
    /**
     * Export PDF
     */
    async exportPDF(stats, emotions, notes) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text('Bao cao Nang suat Lam viec', 20, 20);
            
            doc.setFontSize(12);
            doc.text(`Ngay: ${new Date().toLocaleDateString('vi-VN')}`, 20, 30);

            // Stats
            let y = 50;
            doc.setFontSize(16);
            doc.text('Thong ke', 20, y);
            y += 10;

            doc.setFontSize(12);
            const formattedStats = stats.getFormattedStats();
            doc.text(`Tong thoi gian lam viec: ${formattedStats.totalWorkTime}`, 20, y);
            y += 8;
            doc.text(`Thoi gian tap trung: ${formattedStats.focusedTime}`, 20, y);
            y += 8;
            doc.text(`Thoi gian phan tam: ${formattedStats.distractedTime}`, 20, y);
            y += 8;
            doc.text(`Diem tap trung: ${formattedStats.focusScore}%`, 20, y);
            y += 8;
            doc.text(`So Pomodoro hoan thanh: ${formattedStats.pomodoroCount}`, 20, y);

            // Emotions
            y += 20;
            doc.setFontSize(16);
            doc.text('Phan tich Cam xuc', 20, y);
            y += 10;

            doc.setFontSize(12);
            const emotionCounts = {};
            emotions.forEach(e => {
                emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
            });

            Object.entries(emotionCounts).forEach(([emotion, count]) => {
                doc.text(`${emotion}: ${count} lan`, 20, y);
                y += 8;
            });

            // Notes
            if (notes && notes.length > 0) {
                y += 15;
                doc.setFontSize(16);
                doc.text('Ghi chu', 20, y);
                y += 10;

                doc.setFontSize(10);
                notes.forEach(note => {
                    const noteText = `- ${note.content}`;
                    doc.text(noteText, 20, y);
                    y += 7;
                });
            }

            // Save
            const fileName = `productivity-report-${Date.now()}.pdf`;
            doc.save(fileName);
            
            console.log('✅ PDF exported:', fileName);
            return fileName;
        } catch (error) {
            console.error('PDF export error:', error);
            throw error;
        }
    }

    /**
     * Export CSV
     */
    exportCSV(emotions) {
        try {
            let csv = 'Timestamp,Emotion,Confidence\n';
            
            emotions.forEach(emotion => {
                const time = new Date(emotion.timestamp).toLocaleString('vi-VN');
                csv += `${time},${emotion.emotion},${emotion.confidence}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `emotions-${Date.now()}.csv`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            console.log('✅ CSV exported');
        } catch (error) {
            console.error('CSV export error:', error);
            throw error;
        }
    }
}
