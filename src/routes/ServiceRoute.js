import express from "express";
import multerUpload from "../middleware/multerMiddleware.js";
import { 
  createService, 
  getAllServices, 
  getServiceById, 
  updateService, 
  deleteService,
  getServiceBySlug
} from "../controllers/ServiceController.js";
import authMiddleware from '../middleware/AuthMiddleware.js';

const router = express.Router();
const adminOnly = authMiddleware(['admin']);

// ✅ Multer config - 3 images ke liye fields
// NOTE: field name must match frontend formData names exactly
const upload = multerUpload("services", "image").fields([
  { name: "cardImage", maxCount: 1 },
  { name: "heroImage", maxCount: 1 },
  { name: "servicesOfferedImages", maxCount: 10 } // <-- plural, matches frontend
]);

// Admin routes
router.post("/", upload, adminOnly, createService);
router.put("/:id", upload, adminOnly, updateService);
router.delete("/:id", adminOnly, deleteService);

// Public routes
router.get("/", getAllServices);
router.get("/slug/:slug", getServiceBySlug);
router.get("/:id", getServiceById);

export default router;
