// routes/adminRoute.js

import express from "express";
import { 
    getAllEmployees, 
    getEmployeeCount,
    deleteEmployee,
    createEmployee ,
    getAllAdmins 
} from "../controllers/AdminAllUserController.js";
import authMiddleware from "../middleware/AuthMiddleware.js";

const router = express.Router();

// Sabhi admin routes ke liye middleware
const adminOnly = authMiddleware(['admin']);


router.get("/admins", adminOnly, getAllAdmins);

// === Employee Management Routes ===

// Saare employees ki list get karo
router.get("/employees", adminOnly, getAllEmployees);

// Total employee count get karo
router.get("/employees/count", adminOnly, getEmployeeCount);

// Ek employee ko delete karo
router.delete("/employees/:id", adminOnly, deleteEmployee);


router.post("/employees", adminOnly, createEmployee);

export default router;