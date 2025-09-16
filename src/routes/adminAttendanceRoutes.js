import express from "express";
import { 
    getAllAttendanceByDate, 
    getEmployeeAttendance, 
    updateAttendanceRecord ,
    exportAllAttendance,
    exportEmployeeAttendance,
    getAttendanceSummary
} from "../controllers/attendanceController.js";
import authMiddleware from "../middleware/AuthMiddleware.js";

const router = express.Router();

const adminOnly = authMiddleware(['admin']);

// Get all attendance for a specific date
// Example: GET /api/attendance/admin/all?date=2024-01-15
router.get("/all", adminOnly, getAllAttendanceByDate);

// Get all attendance for a specific employee
// Example: GET /api/attendance/admin/employee/60d...a1b2?year=2024&month=1
router.get("/employee/:employeeId", adminOnly, getEmployeeAttendance);

// Manually update an attendance record
// Example: PUT /api/attendance/admin/update/60d...c3d4
router.put("/update/:attendanceId", adminOnly, updateAttendanceRecord);

// Get attendance summary  Present/Absent Days Count Karna
router.get('/summary/:employeeId',adminOnly, getAttendanceSummary);

// Export routes in excel
router.get("/export/all", adminOnly, exportAllAttendance);
router.get("/export/employee/:employeeId", adminOnly, exportEmployeeAttendance);

export default router;