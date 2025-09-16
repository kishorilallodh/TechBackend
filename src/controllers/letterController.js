import OfferLetter from "../models/OfferLetter.js";
import ExperienceLetter from "../models/ExperienceLetter.js";
import User from "../models/userModel.js"; // Assuming you have a User model
import { generateLetterNumber } from "../utils/generateLetterNumber.js";
import asyncHandler from "express-async-handler";
import mongoose from 'mongoose';

// @desc    (Admin) Create and send an Offer Letter
// @route   POST /api/letters/offer
// @access  Private (Admin)
export const createOfferLetter = asyncHandler(async (req, res) => {
  const { userId, position, joiningDate } = req.body;

  if (!userId || !position || !joiningDate) {
    res.status(400);
    throw new Error("User ID, position, and joining date are required.");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid user ID format.");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found with the provided ID.");
  }
  const letterNumber = await generateLetterNumber(OfferLetter, "OL");

  const newOfferLetter = new OfferLetter({
    user: userId,
    recipientName: user.name, // Get name from User model
    position,
    joiningDate,
    letterNumber,
  });

  const savedLetter = await newOfferLetter.save();
  res
    .status(201)
    .json({
      message: "Offer letter created successfully!",
      letter: savedLetter,
    });
});

// @desc    (Admin) Create and send an Experience Letter
// @route   POST /api/letters/experience
// @access  Private (Admin)
export const createExperienceLetter = asyncHandler(async (req, res) => {
  const { userId, issueDate, position, duration, timePeriod } = req.body;


   if (!userId || !issueDate || !position || !duration || !timePeriod) {
        res.status(400);
        throw new Error("User ID, issue date, position, duration, and time period are required.");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid user ID format.");
    }

  const user = await User.findById(userId);
   if (!user) {
        res.status(404);
        throw new Error('User not found with the provided ID.');
    }

  const letterNumber = await generateLetterNumber(ExperienceLetter, "EL");

  const newExperienceLetter = new ExperienceLetter({
    user: userId,
    recipientName: user.name,
    issueDate,
    position,
    duration,
    timePeriod,
    letterNumber,
  });

  const savedLetter = await newExperienceLetter.save();
  res
    .status(201)
    .json({
      message: "Experience letter created successfully!",
      letter: savedLetter,
    });
});

// @desc    (User) Get all letters for the logged-in user
// @route   GET /api/letters/my-letters
// @access  Private
export const getUserLetters = asyncHandler(async (req, res) => {
  const offerLetters = await OfferLetter.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  const experienceLetters = await ExperienceLetter.find({
    user: req.user.id,
  }).sort({ createdAt: -1 });

  // Add a 'letterType' field to distinguish on the frontend
  const formattedOfferLetters = offerLetters.map((l) => ({
    ...l.toObject(),
    letterType: "Offer",
  }));
  const formattedExperienceLetters = experienceLetters.map((l) => ({
    ...l.toObject(),
    letterType: "Experience",
  }));

  const allLetters = [
    ...formattedOfferLetters,
    ...formattedExperienceLetters,
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json(allLetters);
});
