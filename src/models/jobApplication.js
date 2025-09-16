import mongoose from "mongoose";

const jobapplicationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    position: { type: String, required: true },
    experience: { type: String, required: true },
    portfolio: { type: String, trim: true },
    coverLetter: { type: String, required: true, trim: true },
    resume: { type: String, required: true }, // Path to the resume file
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'],
        default: 'Pending',
    }
}, { timestamps: true });

export default mongoose.model("Application", jobapplicationSchema);