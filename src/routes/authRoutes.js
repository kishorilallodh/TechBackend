// routes/authRoutes.js
import express from "express";
import { register, login, logout ,forgotPassword, resetPassword } from "../controllers/authController.js";
// import authMiddleware from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);


// Forgot Password Route
router.post('/forgot-password', forgotPassword);

// Reset Password Route
router.post('/reset-password/:token', resetPassword);

export default router;










