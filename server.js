import dotenv from "dotenv";
import path from 'path'; // 👈 path module ko import karein
import { fileURLToPath } from 'url'; // 👈 Yeh bhi import karein

// Step 1: Current directory ka poora path nikalein
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });


import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { startAttendanceScheduler } from './src/utils/attendanceScheduler.js';  

connectDB();
startAttendanceScheduler();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});