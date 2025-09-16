import express from "express";
import { getMyProfile, upsertMyProfile,getProfileByUserId  } from "../controllers/profileController.js";
import authMiddleware from "../middleware/AuthMiddleware.js";
import multerUpload from "../middleware/multerMiddleware.js";

const router = express.Router();
// 'imgProfile' subfolder ke liye ek uploader banayein
const profileUploader = multerUpload('imgProfile'); 
const adminOnly = authMiddleware(['admin']);
//  Get current user's profile
router.get("/me", authMiddleware(), getMyProfile);

//  Create or update profile (with image)
router.put("/me", authMiddleware(), profileUploader.single("profileImage"), upsertMyProfile);


router.get('/user/:userId', adminOnly, getProfileByUserId);
export default router;
