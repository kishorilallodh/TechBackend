import express from "express";
import { clockIn, clockOut, getMyAttendance, getTodayAttendance, requestLeave } from "../controllers/attendanceController.js";
import authMiddleware from "../middleware/AuthMiddleware.js"; // Apne auth middleware ka sahi path daalein

const router = express.Router();

// Clock in for the day
router.post("/clock-in", authMiddleware(), clockIn);

// Clock out for the day
router.post("/clock-out", authMiddleware(), clockOut);

// Get current day's attendance status
router.get("/today", authMiddleware(), getTodayAttendance);

// Get attendance for a specific month (e.g., /api/attendance/me?year=2025&month=8)
router.get("/me", authMiddleware(), getMyAttendance);

//User ke liye "Request Leave" ka Feature
router.post('/request-leave',authMiddleware(),  requestLeave);

export default router;