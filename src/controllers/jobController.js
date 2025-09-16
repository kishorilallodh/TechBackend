import Job from "../models/Job.js";
import asyncHandler from "express-async-handler";
import mongoose from 'mongoose';
// Helper for string arrays (Requirements, Responsibilities, etc.)
const parseStringArray = (input) => {
  if (!input) return [];
  if (Array.isArray(input))
    return input.map((item) => item.trim()).filter(Boolean);
  // Split by newline and filter out empty lines
  return input
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

// @desc    Create a new job opening (Admin)
// @route   POST /api/jobs
export const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    department,
    location,
    type,
    salaryMin,
    salaryMax,
    experience,
    description,
    isActive,
  } = req.body;

  if (
    !title ||
    !department ||
    !location ||
    !type ||
    !experience ||
    !description
  ) {
    res.status(400);
    throw new Error(
      "Title, department, location, type, experience, and description are required fields."
    );
  }

  const newJob = await Job.create({
    title,
    department,
    location,
    type,
    salaryMin,
    salaryMax,
    experience,
    description,
    isActive,
    requirements: parseStringArray(req.body.requirements),
    responsibilities: parseStringArray(req.body.responsibilities),
    benefits: parseStringArray(req.body.benefits),
  });
  res.status(201).json({ message: "Job created successfully.", job: newJob });
});

// @desc    Get all active jobs for the public website
// @route   GET /api/jobs
export const getActiveJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(200).json(jobs);
});

// @desc    Get a single job by ID (Public)
// @route   GET /api/jobs/:id
export const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid job ID format.");
  }

  const job = await Job.findById(id);

  if (!job || !job.isActive) {
    res.status(404);
    throw new Error("Job opening not found or is no longer active.");
  }

  res.status(200).json(job);
});

// @desc    Get all jobs (active and inactive) for the admin panel
// @route   GET /api/jobs/admin/all
export const getAllJobsForAdmin = asyncHandler(async (req, res) => {
  const jobs = await Job.find({}).sort({ createdAt: -1 });
  res.status(200).json(jobs);
});

// @desc    Update a job opening (Admin)
// @route   PUT /api/jobs/:id
export const updateJob = asyncHandler(async (req, res) => {
  const {
    title,
    department,
    location,
    type,
    salaryMin,
    salaryMax,
    experience,
    description,
    isActive,
  } = req.body;

  const updates = {
    title,
    department,
    location,
    type,
    salaryMin,
    salaryMax,
    experience,
    description,
    isActive,
    requirements: parseStringArray(req.body.requirements),
    responsibilities: parseStringArray(req.body.responsibilities),
    benefits: parseStringArray(req.body.benefits),
  };

  const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });
  if (!updatedJob) {
    res.status(404);
    throw new Error("Job not found with the provided ID.");
  }

  res
    .status(200)
    .json({ message: "Job updated successfully.", job: updatedJob });
});

// @desc    Delete a job opening (Admin)
// @route   DELETE /api/jobs/:id
export const deleteJob = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid job ID format.");
    }
    
    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
        res.status(404);
        throw new Error("Job not found with the provided ID.");
    }
    
    res.status(200).json({ message: "Job deleted successfully." });
});