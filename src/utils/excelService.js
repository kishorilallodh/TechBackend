// utils/excelService.js

import ExcelJS from 'exceljs';

// Helper functions
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB') : 'N/A';
const formatTime = (dateString) => dateString ? new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

export const generateAttendanceReport = async (records, reportType = 'single_user', year, month) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TechDigi Software';
    const worksheet = workbook.addWorksheet('Attendance Report');

    if (reportType === 'all_users_matrix') {
        if (!records || records.length === 0) {
            worksheet.addRow(['No attendance records found for the selected period.']);
            return await workbook.xlsx.writeBuffer();
        }
        
        const userData = new Map();
        records.forEach(record => {
            const userId = record.user._id.toString();
            if (!userData.has(userId)) {
                userData.set(userId, {
                    name: record.user.name || 'N/A',
                    email: record.user.email || 'N/A',
                    attendance: new Map()
                });
            }
            const dayOfMonth = new Date(record.date).getDate();
            userData.get(userId).attendance.set(dayOfMonth, record);
        });

        // This part is already correct and handles 30/31 days automatically
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Header Row 1 (Merged Dates)
        const headerRow1 = worksheet.addRow(['Employee Name', 'Email']);
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${String(day).padStart(2,'0')}-${new Date(year, month - 1, day).toLocaleString('default', { month: 'short' })}`;
            
            // highlight-start
            // --- YEH HAI SAHI CALCULATION ---
            const startColumn = (day - 1) * 3 + 3;
            const cell = headerRow1.getCell(startColumn);
            // --- BADLAAV KHATAM ---
            
            cell.value = dateStr;
            // Har date ke liye 3 columns merge karein
            worksheet.mergeCells(1, startColumn, 1, startColumn + 2);
        }
        
        // Header Row 2 (Sub-headers: In, Out, Status)
        const headerRow2 = worksheet.addRow(['', '']);
        for (let day = 1; day <= daysInMonth; day++) {
            const startColumn = (day - 1) * 3 + 3;
            headerRow2.getCell(startColumn).value = 'In';
            headerRow2.getCell(startColumn + 1).value = 'Out';
            headerRow2.getCell(startColumn + 2).value = 'Status';
        }

        // Header Styling (No change here)
        [headerRow1, headerRow2].forEach(row => {
            row.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF03286D' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });
        });
        worksheet.getColumn('A').width = 25;
        worksheet.getColumn('B').width = 30;

        const statusStyles = { /* ... (No change here) ... */ };

        // Data Rows (No change here)
        userData.forEach(user => {
            const rowData = [user.name, user.email];
            for (let day = 1; day <= daysInMonth; day++) {
                const record = user.attendance.get(day);
                if (record) {
                    rowData.push(formatTime(record.clockInTime));
                    rowData.push(formatTime(record.clockOutTime));
                    rowData.push(record.status);
                } else {
                    rowData.push('-');
                    rowData.push('-');
                    rowData.push('Absent');
                }
            }
            const addedRow = worksheet.addRow(rowData);
            
            // Cell Styling (No change here)
            for (let day = 1; day <= daysInMonth; day++) {
                const startColumn = (day - 1) * 3 + 3;
                const statusCell = addedRow.getCell(startColumn + 2);
                const status = statusCell.value;
                if(statusStyles[status]){
                    statusCell.fill = statusStyles[status].fill;
                    statusCell.font = statusStyles[status].font;
                }
                addedRow.getCell(startColumn).alignment = { horizontal: 'center' };
                addedRow.getCell(startColumn + 1).alignment = { horizontal: 'center' };
                statusCell.alignment = { horizontal: 'center' };
            }
        });
    
    }   else if (reportType === 'single_user') {
        // 1. Columns me 'Name' ko waapas add karein
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Name', key: 'name', width: 30 }, // <-- YEH COLUMN WAAPAS ADD KIYA GAYA HAI
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Clock In', key: 'clockIn', width: 15 },
            { header: 'Clock Out', key: 'clockOut', width: 15 },
            { header: 'Duration (H:M)', key: 'duration', width: 15 },
            { header: 'Work Plan / Summary', key: 'work', width: 60 },
        ];

        // Header ko style karein
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF03286D' } };
        });

        // 2. Data add karte samay 'name' ko bhi add karein
        records.forEach(record => {
            const durationHours = record.durationMinutes ? Math.floor(record.durationMinutes / 60) : 0;
            const durationMins = record.durationMinutes ? record.durationMinutes % 60 : 0;
            
            worksheet.addRow({
                date: formatDate(record.date),
                name: record.user?.name || 'N/A', // <-- YEH DATA POINT WAAPAS ADD KIYA GAYA HAI
                status: record.status,
                clockIn: formatTime(record.clockInTime),
                clockOut: formatTime(record.clockOutTime),
                duration: record.durationMinutes ? `${durationHours}h ${durationMins}m` : 'N/A',
                work: record.workSummary || record.workPlan || 'N/A',
            });
        });
    }
    // === BADLAAV KHATAM ===
    // highlight-end

    return await workbook.xlsx.writeBuffer();
};