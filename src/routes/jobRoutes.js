import express from "express";
import {
    createJob,
    getActiveJobs,
    getJobById,
    getAllJobsForAdmin,
    updateJob,
    deleteJob
} from "../controllers/jobController.js";
import authMiddleware from "../middleware/AuthMiddleware.js";


const router = express.Router();

// Admin ke liye middleware
const adminOnly = authMiddleware(['admin']);

// =============================
//      PUBLIC ROUTES
// =============================

// Website par saari active jobs dikhane ke liye
// GET /api/jobs
router.get("/", getActiveJobs);

// Website par ek single job ki details dikhane ke liye
// GET /api/jobs/some-job-id
router.get("/:id", getJobById);


// =============================
//      ADMIN-ONLY ROUTES
// =============================

// Admin panel me saari jobs (active/inactive) dikhane ke liye
// GET /api/jobs/admin/all
router.get("/admin/all", adminOnly, getAllJobsForAdmin);

// Admin dwara nayi job create karne ke liye
// POST /api/jobs
router.post("/", adminOnly, createJob);

// Admin dwara job update karne ke liye
// PUT /api/jobs/some-job-id
router.put("/:id", adminOnly, updateJob);

// Admin dwara job delete karne ke liye
// DELETE /api/jobs/some-job-id
router.delete("/:id", adminOnly, deleteJob);

export default router;