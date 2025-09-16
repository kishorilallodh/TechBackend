// routes/technologyRoutes.js (New File)

import express from 'express';
import { 
    createTechnology, 
    getAllTechnologies,
     updateTechnology, 
    deleteTechnology 
} from '../controllers/technologyController.js';
import authMiddleware from '../middleware/AuthMiddleware.js';

const router = express.Router();
const adminOnly = authMiddleware(['admin']);

// READ: Get all technologies (Public)
router.get('/', getAllTechnologies);

// CREATE: Create a new technology (Admin only)
router.post('/', adminOnly, createTechnology);

// UPDATE: Update a technology by ID (Admin only)
router.put('/:id', adminOnly, updateTechnology);

// DELETE: Delete a technology by ID (Admin only)
router.delete('/:id', adminOnly, deleteTechnology);

export default router;