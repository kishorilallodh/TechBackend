import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], required: true },
    salaryMin: { type: Number, required: true },
    salaryMax: { type: Number, required: true },
    experience: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requirements: { type: [String], required: true },
    responsibilities: { type: [String], required: true },
    benefits: { type: [String], required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Salary ko LPA format me dikhane ke liye virtual property
jobSchema.virtual('salaryLPA').get(function() {
    const formatToLPA = (num) => (num / 100000).toFixed(1);
    return `${formatToLPA(this.salaryMin)} - ${formatToLPA(this.salaryMax)} LPA`;
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

export default mongoose.model("Job", jobSchema);