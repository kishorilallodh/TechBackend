// routes/certificateRoutes.js
import express from 'express';
import { submitRequest, getUserRequests, getAllRequestsForAdmin, updateRequestStatus,deleteRequest,verifyCertificate } from '../controllers/certificateController.js';
import authMiddleware from "../middleware/AuthMiddleware.js"; 

const router = express.Router();
const adminOnly = authMiddleware(['admin']);
// --- User Routes ---
// POST: User ek naya certificate request submit karega
router.post('/request', authMiddleware(), submitRequest);
// GET: User apne saare requests dekh sakta hai
router.get('/my-requests', authMiddleware(), getUserRequests);

// --- Admin Routes ---
// GET: Admin saare users ke pending/approved/rejected requests dekhega
router.get('/admin/all', adminOnly, getAllRequestsForAdmin);
// PUT: Admin ek request ka status update karega (Approve/Reject)
router.put('/admin/update/:id', adminOnly, updateRequestStatus);

// Add the new delete route
router.delete('/admin/delete/:id', adminOnly, deleteRequest);

// POST: Anyone can verify a certificate. No auth middleware needed.
router.post('/verify', verifyCertificate);

export default router;