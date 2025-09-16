import express from 'express';
import {
    submitQuery,
    getAllQueries,
    replyToQuery,
    deleteQuery
} from '../controllers/queryController.js';
import authMiddleware from '../middleware/AuthMiddleware.js';

const router = express.Router();
const adminOnly = authMiddleware(['admin']);

// === PUBLIC ROUTE ===
// Contact form se query submit karne ke liye
router.post('/', submitQuery);


// === ADMIN ROUTES ===
// Admin panel me saari queries dekhne ke liye
router.get('/admin/all', adminOnly, getAllQueries);

// Admin dwara query ka reply karne ke liye
router.post('/:id/reply', adminOnly, replyToQuery);

// Admin dwara query delete karne ke liye
router.delete('/:id', adminOnly, deleteQuery);


export default router;