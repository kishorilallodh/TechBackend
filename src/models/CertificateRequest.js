// models/CertificateRequest.js
import mongoose from 'mongoose';

const CertificateRequestSchema = new mongoose.Schema({
    // Kaunsa user request kar raha hai
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Aapke User model ka reference
        required: true,
    },
    // User dwara bhari gayi details
    certificateType: {
        type: String,
        required: [true, 'Certificate type is required'], // Example: 'Course Completion', 'Internship'
    },
    nameOnCertificate: {
        type: String,
        required: [true, 'Name for the certificate is required'],
    },
    courseName: {
        type: String,
        required: [true, 'Course name is required'],
    },
    // === MODIFIED SECTION START ===
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    completionDate: {
        type: Date,
        required: [true, 'Completion date is required'],
    },
    // === MODIFIED SECTION END ===
    duration: {
        type: String, // Example: '3 Months', '40 Hours'
        required: true,
    },
    message: {
        type: String, // User ka optional message
    },
    // Admin ke liye fields
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    adminRemarks: {
        type: String, // Admin jab approve/reject karega toh note likh sakta hai
    },
     certificateNumber: {
        type: String,
        unique: true, // Har certificate ka number unique hona chahiye
        sparse: true, // 'unique' constraint sirf un documents par lagega jahan ye field exist karti hai (null par nahi)
        default: null, // Default mein null rahega, jab tak approve na ho
    },
}, { timestamps: true }); // createdAt aur updatedAt automatically add ho jayenge

const CertificateRequest = mongoose.model('CertificateRequest', CertificateRequestSchema);
export default CertificateRequest;