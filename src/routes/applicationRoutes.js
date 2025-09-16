import express from 'express';
import { 
    submitApplication,
    getAllApplications,
    updateApplicationStatus,
    deleteApplication        
 } from '../controllers/applicationController.js';
import multerUpload from '../middleware/multerMiddleware.js';
import authMiddleware from '../middleware/AuthMiddleware.js';

const router = express.Router();


const resumeUploader = multerUpload('resumes', 'document');
const adminOnly = authMiddleware(['admin']);

// Public route to submit an application
router.post('/', resumeUploader.single('resume'), submitApplication);

// Admin route to view all applications
router.get('/admin/all', adminOnly, getAllApplications);

// Admin route to update status
router.put('/:id/status', adminOnly, updateApplicationStatus);

// Admin route to delete an application
router.delete('/:id', adminOnly, deleteApplication);

export default router;