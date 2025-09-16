import express from 'express';
import { createOfferLetter, createExperienceLetter, getUserLetters } from '../controllers/letterController.js';
import authMiddleware from "../middleware/AuthMiddleware.js"; 

const router = express.Router();
const adminOnly = authMiddleware(['admin']);

 
// --- Admin Routes ---
router.post('/offer', adminOnly, createOfferLetter);
router.post('/experience', adminOnly, createExperienceLetter);

// --- User Routes ---
router.get('/my-letters', authMiddleware(), getUserLetters);

export default router; 