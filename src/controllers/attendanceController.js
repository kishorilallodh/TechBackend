import mongoose from 'mongoose'; 
import Attendance from "../models/Attendance.js";
import { generateAttendanceReport } from '../utils/excelService.js';
import asyncHandler from 'express-async-handler';
// Helper function to get the start of the day (midnight)
const getStartOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};

/**
 * @route   POST /api/attendance/clock-in
 * @desc    Mark user's clock-in time and work plan
 * @access  Private
 */
export const clockIn = asyncHandler(async (req, res) => {
    const { workPlan } = req.body;
    const userId = req.user.id;

    if (!workPlan) {
        res.status(400);
        throw new Error("Work plan is required to clock in.");
    }

    
        const today = getStartOfDay(new Date());

        // Check if user has already clocked in today
        const existingAttendance = await Attendance.findOne({ user: userId, date: today });
        if (existingAttendance) {
        res.status(400);
        throw new Error("You have already clocked in today.");
    }

        const newAttendance = await Attendance.create({
            user: userId,
            date: today,
            clockInTime: new Date(),
            workPlan: workPlan,
            status: 'Present',
        });

        res.status(201).json({ message: "Clocked in successfully.", attendance: newAttendance });

});

/**
 * @route   POST /api/attendance/clock-out
 * @desc    Mark user's clock-out time and work summary
 * @access  Private
 */
export const clockOut = asyncHandler(async (req, res) => {
    const { workSummary } = req.body;
    const userId = req.user.id;

    if (!workSummary) {
        res.status(400);
        throw new Error("Work summary is required to clock out.");
    }

    
        const today = getStartOfDay(new Date());
        const clockOutTime = new Date();

        // Find today's attendance record
        const attendance = await Attendance.findOne({ user: userId, date: today });

       if (!attendance) {
        res.status(404);
        throw new Error("You have not clocked in yet today. Cannot clock out.");
    }

      if (attendance.clockOutTime) {
        res.status(400);
        throw new Error("You have already clocked out today.");
    }

        // Calculate duration in minutes
        const durationMs = clockOutTime - attendance.clockInTime;
        const durationMinutes = Math.round(durationMs / 60000);

        // Update the record
        attendance.clockOutTime = clockOutTime;
        attendance.workSummary = workSummary;
        attendance.durationMinutes = durationMinutes;

        const updatedAttendance = await attendance.save();

        res.status(200).json({ message: "Clocked out successfully.", attendance: updatedAttendance });

});

/**
 * @route   GET /api/attendance/today
 * @desc    Get user's attendance status for today
 * @access  Private
 */
export const getTodayAttendance = asyncHandler(async (req, res) => {
    
        const today = getStartOfDay(new Date());
        const attendance = await Attendance.findOne({ user: req.user.id, date: today });

        // If no record, send an object indicating not clocked in
        if (!attendance) {
            return res.status(200).json({ status: 'NotClockedIn' });
        }
        
        res.status(200).json(attendance);

});


/**
 * @route   GET /api/attendance/me
 * @desc    Get user's attendance for a specific month
 * @access  Private
 */
export const getMyAttendance = asyncHandler(async (req, res) => {
    const { year, month } = req.query; // Expects year=2025, month=8

    if (!year || !month) {
        res.status(400);
        throw new Error("Year and month query parameters are required.");
    }

   
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month

        const records = await Attendance.find({
            user: req.user.id,
            date: { $gte: startDate, $lte: endDate }
        }).select('date status'); // Select only needed fields

        res.status(200).json(records);
    
});


// ========== ADMIN CONTROLLERS ==========
/**
 * @route   GET /api/attendance/admin/all
 * @desc    (Admin) Get all attendance records for a specific date
 * @access  Admin Private
 */
export const getAllAttendanceByDate = asyncHandler(async (req, res) => {
    const { date } = req.query; // Expects date in YYYY-MM-DD format
     if (!date) {
        res.status(400);
        throw new Error("Date query parameter is required (YYYY-MM-DD).");
    }

    
        const targetDate = getStartOfDay(new Date(date));

        const records = await Attendance.find({ date: targetDate })
            .populate('user', 'name email'); // Populate user details

        res.status(200).json(records);
    
});

/**
 * @route   GET /api/attendance/admin/employee/:employeeId
 * @desc    (Admin) Get all attendance for a specific employee
 * @access  Admin Private
 */
export const getEmployeeAttendance = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const { year, month } = req.query; // Optional filters

     if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        res.status(400);
        throw new Error("Invalid employee ID format.");
    }

        let query = { user: employeeId };

        if (year && month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const records = await Attendance.find(query)
            .populate('user', 'name email mobile') // Get more user info for details page
            .sort({ date: -1 }); // Show recent records first

        res.status(200).json(records);
   
});

/**
 * @route   PUT /api/attendance/admin/update/:attendanceId
 * @desc    (Admin) Manually update an attendance record (e.g., mark leave)
 * @access  Admin Private
 */
export const updateAttendanceRecord = asyncHandler(async (req, res) => {
    const { attendanceId } = req.params;
    const { status, workPlan, workSummary } = req.body;

   if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
        res.status(400);
        throw new Error("Invalid attendance record ID format.");
    }

        const record = await Attendance.findById(attendanceId);
        if (!record) {
        res.status(404);
        throw new Error("Attendance record not found.");
    }

        if (status) record.status = status;
        if (workPlan) record.workPlan = workPlan;
        if (workSummary) record.workSummary = workSummary;
        // You can add more fields to update here

        const updatedRecord = await record.save();
        res.status(200).json({ message: "Record updated successfully.", attendance: updatedRecord });
    
});


/**
 * @route   GET /api/attendance/admin/export/all in excel file
 * @desc    (Admin) Export all employees' attendance for a month
 * @access  Admin Private
 */
export const exportAllAttendance = asyncHandler(async (req, res) => {
    const { year, month } = req.query;
     if (!year || !month) {
        res.status(400);
        throw new Error("Year and month are required for export.");
    }

   
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const records = await Attendance.find({ date: { $gte: startDate, $lte: endDate } })
            .populate('user', 'name email')
            .sort({  'user.name': 1,date: 1, });  

       // MODIFIED: Use the new report type and pass year/month
         const buffer = await generateAttendanceReport(records, 'all_users_matrix', year, month);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=All_Attendance_${year}-${month}.xlsx`);
        res.send(buffer);

});

/**
 * @route   GET /api/attendance/admin/export/employee/:employeeId
 * @desc    (Admin) Export a single employee's attendance for a month
 * @access  Admin Private
 */
export const exportEmployeeAttendance = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const { year, month } = req.query;
   if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        res.status(400);
        throw new Error("Invalid employee ID format.");
    }

    if (!year || !month) {
        res.status(400);
        throw new Error("Year and month are required for export.");
    }

    
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const records = await Attendance.find({ 
            user: employeeId,
            date: { $gte: startDate, $lte: endDate }
        }).populate('user', 'name email').sort({ date: 1 });

        if (records.length === 0) {
        res.status(404);
        throw new Error("No attendance records found for this employee in the selected month.");
    }

        const buffer = await generateAttendanceReport(records, 'single_user');
        
        const filename = records[0]?.user?.name.replace(/\s+/g, '_') || 'Employee';
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}_Attendance_${year}-${month}.xlsx`);
        res.send(buffer);

});



/**
 * @route   POST /api/attendance/request-leave
 * @desc    User requests a leave for today
 * @access  Private
 */
export const requestLeave = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason) {
        res.status(400);
        throw new Error("A reason for the leave is required.");
    }

    
        const today = getStartOfDay(new Date());

        // Check if user has already clocked in or requested leave today
        const existingAttendance = await Attendance.findOne({ user: userId, date: today });
       if (existingAttendance) {
        res.status(400);
        throw new Error(`You have already marked your attendance as '${existingAttendance.status}' for today.`);
    }

        // Create a new leave record
        const newLeaveRecord = await Attendance.create({
            user: userId,
            date: today,
            status: 'Leave',
            workPlan: `Leave Reason: ${reason}`, // Hum workPlan field ko reason store karne ke liye use kar sakte hain
            clockInTime: new Date(), // We can set a time for record-keeping
        });

        res.status(201).json({ message: "Leave has been recorded successfully.", attendance: newLeaveRecord });

});

/**
 * @route   GET /api/attendance/admin/summary/:employeeId
 * @desc    (Admin) Get attendance summary (Present, Absent+Leave) for an employee
 * @access  Admin Private
 */
export const getAttendanceSummary = asyncHandler(async (req, res, next) => { // 'next' ko add karein error handling ke liye
    const { employeeId } = req.params;
    const { year, month } = req.query;

   if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        res.status(400);
        throw new Error("Invalid employee ID format.");
    }

    if (!year || !month) {
        res.status(400);
        throw new Error("Year and month query parameters are required.");
    }

    
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Nayi Aggregation Pipeline
        const summary = await Attendance.aggregate([
            // Step 1: Zaroori records ko filter karein (employee aur date range)
            {
                $match: {
                    user: new mongoose.Types.ObjectId(employeeId),
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            // Step 2: Ek naya field 'summaryStatus' banayein
            // Agar status 'Leave' hai, to use 'Absent' maan lein
            {
                $addFields: {
                    summaryStatus: {
                        $cond: {
                           if: { $in: ['$status', ['Absent', 'Leave']] },
                           then: 'Absent',
                           else: '$status' // 'Present', 'Holiday' ko waise hi rehne dein
                        }
                    }
                }
            },
            // Step 3: Naye field 'summaryStatus' ke hisab se group karein
            {
                $group: {
                    _id: '$summaryStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Result ko ek aasaan object me format karein
        const result = {
            Present: 0,
            Absent: 0,
            Holiday: 0, // Holiday jaise doosre status ko bhi handle kar sakte hain
        };
        summary.forEach(item => {
            // Agar _id null nahi hai tabhi add karein
            if (item._id) {
                result[item._id] = item.count;
            }
        });

        res.status(200).json(result);

});