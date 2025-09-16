// routes/adminRoutes.js
import express from 'express';
import { createAdmin } from '../controllers/adminController.js';
import authMiddleware from '../middleware/AuthMiddleware.js';

const router = express.Router();

// POST /api/admin/create-admin
// Yeh route sirf un users ke liye hai jinka role 'admin' hai
router.post('/create-admin', authMiddleware(['admin']), createAdmin);

export default router;