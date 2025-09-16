import asyncHandler from "express-async-handler";
import Technology from "../models/Technology.js";
import Service from "../models/Service.js";
import mongoose from 'mongoose';
// 1. CREATE
// controllers/technologyController.js
export const createTechnology = asyncHandler(async (req, res) => {
  const { name, iconString, colorClass, category } = req.body;
  if (!name || !iconString) {
    res.status(400);
    throw new Error("Name and Icon String are required fields.");
  }

  let tech = await Technology.findOne({ name });
  if (tech) {
    res.status(409); // Conflict
    throw new Error("A technology with this name already exists.");
  }

  tech = new Technology({
    name,
    iconString,
    colorClass: colorClass || "text-gray-500",
    category: category || "firstRow", // ✅ default handled by schema but extra safeguard
  });

  await tech.save();
  res
    .status(201)
    .json({ message: "Technology created successfully!", technology: tech });
});
// 2. READ
export const getAllTechnologies = asyncHandler(async (req, res) => {
  // This function is perfect, no changes needed

  const technologies = await Technology.find({}).sort({ name: 1 });
  res.status(200).json(technologies);
});

// 3. UPDATE
/**
 * @route   PUT /api/technologies/:id
 * @desc    Update an existing technology
 * @access  Admin Private
 */
export const updateTechnology = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, iconString, colorClass, category } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid technology ID format.");
  }

  const techToUpdate = await Technology.findById(id);
  if (!techToUpdate) {
    res.status(404);
    throw new Error("Technology not found.");
  }

  if (name) {
    const existingTech = await Technology.findOne({ name, _id: { $ne: id } });
    if (existingTech) {
      res.status(409); // Conflict
      throw new Error("Another technology with this name already exists.");
    }
    techToUpdate.name = name;
  }
  if (iconString) techToUpdate.iconString = iconString;
  if (colorClass) techToUpdate.colorClass = colorClass;

  if (category && ["firstRow", "secondRow"].includes(category)) {
    techToUpdate.category = category;
  }

  const updatedTechnology = await techToUpdate.save();
  res
    .status(200)
    .json({
      message: "Technology updated successfully!",
      technology: updatedTechnology,
    });
});

// 4. DELETE
/**
 * @route   DELETE /api/technologies/:id
 * @desc    Delete a technology and remove it from all services
 * @access  Admin Private
 */
export const deleteTechnology = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid technology ID format.");
  }

  const tech = await Technology.findByIdAndDelete(id);
  if (!tech) {
    res.status(404);
    throw new Error("Technology not found.");
  }

  // ✅ Best Practice: When a technology is deleted, remove its reference
  // from all services that were using it.
  await Service.updateMany(
    { technologies: id },
    { $pull: { technologies: id } }
  );

  res.status(200).json({ message: "Technology deleted successfully.", id });
});
