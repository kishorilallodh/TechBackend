import mongoose from 'mongoose';
import Application from '../models/jobApplication.js';
import { sendApplicationConfirmation, sendAdminNotification, sendStatusUpdateEmail } from '../utils/emailService.js';
import asyncHandler from 'express-async-handler';
// @desc    Submit a new job application (Public)
// @route   POST /api/applications
export const submitApplication = asyncHandler(async (req, res) => {
    const { name, email, phone, position, experience, portfolio, coverLetter } = req.body;
    
    if (!req.file) {
        res.status(400);
        throw new Error("Resume is a required field. Please upload your resume.");
    }

    const resumePath = `/${req.file.path.replace(/\\/g, "/").replace("public/", "")}`;

    
        const newApplication = await Application.create({
            name, email, phone, position, experience, portfolio, coverLetter,
            resume: resumePath,
        });

        // Email bhejein (background me)
        sendApplicationConfirmation(email, name, position).catch(console.error);
        sendAdminNotification(newApplication).catch(console.error);

        res.status(201).json({ message: "Application submitted successfully! We will get back to you soon." });
    
});

// @desc    Get all applications (Admin)
// @route   GET /api/applications/admin/all
export const getAllApplications = asyncHandler(async (req, res) => {
   
        const applications = await Application.find({}).sort({ createdAt: -1 });
        res.status(200).json(applications);
    
});


/* @route   PUT /api/applications/:id/status
 * @desc    (Admin) Update an application's status
 * @access  Admin Private
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // Expects { status: 'Shortlisted' } or { status: 'Rejected' }
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid application ID format.");
    }

    // 👈 CHANGE 3: Validate status value
    const validStatuses = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'];
    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status. Please use one of the following: ${validStatuses.join(', ')}`);
    }

   
        const application = await Application.findById(id);
        if (!application) {
        res.status(404); // Not Found
        throw new Error("Application not found with the provided ID.");
    }

        application.status = status;
        const updatedApplication = await application.save();
        
        // Status update ka email bhejo
        sendStatusUpdateEmail(application.email, application.name, application.position, status).catch(console.error);

        res.status(200).json(updatedApplication);
   
});

/**
 * @route   DELETE /api/applications/:id
 * @desc    (Admin) Delete an application
 * @access  Admin Private
 */
export const deleteApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid application ID format.");
    }

        const application = await Application.findByIdAndDelete(id);
         if (!application) {
        res.status(404); // Not Found
        throw new Error("Application not found with the provided ID.");
    }
        // Optional: Resume file ko server se delete karein
        // deleteFile(application.resume);
        res.status(200).json({ message: "Application deleted successfully." });
    
});   