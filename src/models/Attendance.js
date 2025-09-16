import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: Date, // We'll store the date at midnight UTC for easy querying
        required: true,
    },
    clockInTime: {
        type: Date,
        required: true,
    },
    clockOutTime: {
        type: Date,
    },
    workPlan: {
        type: String,
        required: true,
        trim: true,
    },
    workSummary: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave', 'Holiday'],
        default: 'Present',
    },
    durationMinutes: { // Store total worked duration in minutes
        type: Number,
    },
}, { timestamps: true });

// Ensure a user can only have one attendance record per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);