import express from 'express';
import {
    getEmployeeSalaryDetails,
    createManualSalarySlip,
    publishSalarySlip,
    getSlipsForAdmin,
    getMySlipsForEmployee,
    getMonthlyHistoryForAdmin
} from '../controllers/salaryController.js';
import authMiddleware from '../middleware/AuthMiddleware.js';

const router = express.Router();

// Apne middleware ko yahan configure karein
const adminOnly = authMiddleware(['admin']);


// --- Admin Routes ---
router.get('/details/:userId/:month/:year', adminOnly, getEmployeeSalaryDetails);
router.post('/create-manual/:userId', adminOnly, createManualSalarySlip);
router.patch('/publish/:slipId', adminOnly, publishSalarySlip);
router.get('/admin/history', adminOnly, getMonthlyHistoryForAdmin);
router.get('/admin/:userId', adminOnly, getSlipsForAdmin);

// --- Employee Route ---
router.get('/employee/my-slips', authMiddleware(), getMySlipsForEmployee);

export default router;