import fs from "fs";
import path from "path";
import mongoose from 'mongoose';
import asyncHandler from "express-async-handler";
import Testimonial from "../models/testimonial.js";

// Helper to delete files
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(
    process.cwd(),
    "public",
    filePath.replace(/\\/g, "/")
  );
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Error deleting file:", err);
    }
  });
};

// @desc    Create a new testimonial (Admin)
// @route   POST /api/testimonials
export const createTestimonial = asyncHandler(async (req, res) => {
  const { name, review, rating, isPublished } = req.body;
  if (!name || !review || !rating) {
    res.status(400);
    throw new Error("Name, review, and rating are required fields.");
  }
  if (!req.file) {
    res.status(400);
    throw new Error("Avatar image is required.");
  }

  const avatarPath = `/${req.file.path
    .replace(/\\/g, "/")
    .replace("public/", "")}`;

  const newTestimonial = await Testimonial.create({
    name,
    review,
    rating,
    avatar: avatarPath,
    isPublished,
  });
  res.status(201).json(newTestimonial);
});

// @desc    Get all published testimonials (Public)
// @route   GET /api/testimonials
export const getPublishedTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isPublished: true }).sort({
    createdAt: -1,
  });
  res.status(200).json(testimonials);
});

// @desc    Get all testimonials (Admin)
// @route   GET /api/testimonials/admin/all
export const getAllTestimonialsForAdmin = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
  res.status(200).json(testimonials);
});

// @desc    Update a testimonial (Admin)
// @route   PUT /api/testimonials/:id
export const updateTestimonial = asyncHandler(async (req, res) => {
  const { name, review, rating, isPublished } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid testimonial ID format.");
  }

  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    res.status(404);
    throw new Error("Testimonial not found.");
  }

  const updates = { name, review, rating, isPublished };

  if (req.file) {
    deleteFile(testimonial.avatar); // Delete old avatar
    updates.avatar = `/${req.file.path
      .replace(/\\/g, "/")
      .replace("public/", "")}`;
  }

  const updatedTestimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true }
  );
  res.status(200).json(updatedTestimonial);
});

// @desc    Delete a testimonial (Admin)
// @route   DELETE /api/testimonials/:id
export const deleteTestimonial = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid testimonial ID format.");
  }

  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    res.status(404);
    throw new Error("Testimonial not found.");
  }
  deleteFile(testimonial.avatar); // Delete avatar from server
  await Testimonial.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Testimonial deleted successfully." });
});
