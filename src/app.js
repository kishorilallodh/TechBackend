import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';

// Route imports
import adminRoutes from './routes/AdminAllUserRoute.js';
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import jobRoutes from "./routes/jobRoutes.js"; 
import applicationRoutes from "./routes/applicationRoutes.js";
import queryRoutes from "./routes/queryRoutes.js"; 
import adminAttendanceRoutes from "./routes/adminAttendanceRoutes.js";
import certificateRoutes from './routes/certificateRoutes.js';
import letterRoutes from './routes/letterRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import serviceRoutes from './routes/ServiceRoute.js';
import technologyRoutes from './routes/technologyRoutes.js';
import errorHandler from "./middleware/errorHandler.js";
const app = express();


// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- YAHAN PAR HAI FINAL CORRECTION ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 Sirf yeh ek line rakhein. Yeh 'src' se ek level upar jakar 'public' folder ko serve karegi.
app.use(express.static(path.join(__dirname, '../public')));
// app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// --- END OF CORRECTION ---

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api/attendance/admin", adminAttendanceRoutes);
app.use("/api/attendance", attendanceRoutes); 
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/queries", queryRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/technologies', technologyRoutes); 
app.use('/api/services', serviceRoutes);
app.use(errorHandler);



export default app;