import express from "express";
import {
    createTestimonial,
    getPublishedTestimonials,
    getAllTestimonialsForAdmin,
    updateTestimonial,
    deleteTestimonial
} from "../controllers/testimonialController.js";
import authMiddleware from "../middleware/AuthMiddleware.js";
import multerUpload from "../middleware/multerMiddleware.js";

const router = express.Router();

const adminOnly = authMiddleware(['admin']);
// 'testimonials' subfolder ke liye ek uploader banayein
const testimonialUploader = multerUpload('testimonials');

// === PUBLIC ROUTE ===
// Website par testimonials dikhane ke liye
router.get("/", getPublishedTestimonials);


// === ADMIN ROUTES ===
// Admin panel ke liye saare testimonials fetch karna
router.get("/admin/all", adminOnly, getAllTestimonialsForAdmin);

// Naya testimonial add karna
router.post("/", adminOnly, testimonialUploader.single('avatar'), createTestimonial);

// Testimonial update karna
router.put("/:id", adminOnly, testimonialUploader.single('avatar'), updateTestimonial);

// Testimonial delete karna
router.delete("/:id", adminOnly, deleteTestimonial);

export default router;