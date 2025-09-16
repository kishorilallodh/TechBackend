import fs from "fs";
import path from "path";
import mongoose from 'mongoose';
import asyncHandler from "express-async-handler";
// Correction: Model ka naam "Profile.js" hai to import bhi "Profile" hona chahiye
import Profile from "../models/Profile.js";
import User from "../models/userModel.js";

// Helper function to safely delete a file if it exists (No changes here)
const deleteLocalFile = (localPath) => {
  if (!localPath) return;
  const absolutePath = path.join(
    process.cwd(),
    localPath.startsWith("/") ? localPath.substring(1) : localPath
  );
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Error deleting old profile image:", err);
    }
  });
};

// Helper to extract allowed fields from request body (No changes here)
const getProfileUpdates = (body) => {
  const allowedFields = [
    "dob",
    "address",
    "city",
    "state",
    "pincode",
    "designation", // <-- Added
    "panNumber", // <-- Added
    "bankAccountNumber", // <-- Added
  ];
  const updates = {};

  for (const key of allowedFields) {
    // We check for 'undefined' to allow empty strings "" to be saved
    if (body[key] !== undefined) {
      updates[key] = body[key];
    }
  }

  // Validate and parse date
  if (updates.dob) {
    const date = new Date(updates.dob);
    if (isNaN(date.getTime())) {
      // It's better to throw the error from here
      const err = new Error(
        "Invalid Date of Birth format. Please use YYYY-MM-DD."
      );
      err.statusCode = 400; // Custom property for the error handler
      throw err;
    }
    updates.dob = date;
  }

  return updates;
};

/**
 * @route   GET /api/profile/me
 * @desc    Get current user's profile
 * @access  Private
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  // highlight-start
  // === YAHAN PAR BADLAAV KIYA GAYA HAI ===
  let profile = await Profile.findOne({ user: req.user.id })
    .select("+bankAccountNumber") // Explicitly ask for the hidden field
    .populate("user", "name email mobile role");
  // highlight-end

  if (!profile) {
    return res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile,
        role: req.user.role,
      },
      joiningDate: req.user.createdAt,
      dob: null,
      address: "",
      city: "",
      state: "",
      pincode: "",
      profileImage: null,
      designation: "",
      panNumber: "",
      bankAccountNumber: "", // Default response me empty string hi rahega
    });
  }

  res.json(profile);
});

/**
 * @route   PUT /api/profile/me
 * @desc    Create or update user profile
 * @access  Private
 */
// (No changes needed in this function, it's perfect)
export const upsertMyProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const updates = getProfileUpdates(req.body);
  const userId = req.user.id;

  if (name) {
    await User.findByIdAndUpdate(userId, { name: name });
  }

  const existingProfile = await Profile.findOne({ user: userId });
  const oldImagePath = existingProfile ? existingProfile.profileImage : null;

  if (req.file) {
    const filePath = req.file.path.replace(/\\/g, "/").replace("public/", "");
    updates.profileImage = `/${filePath}`;
  }

  // highlight-start
  // === YAHAN BHI BADLAAV KIYA GAYA HAI ===
  const updatedProfile = await Profile.findOneAndUpdate(
    { user: userId },
    {
      $set: updates,
      $setOnInsert: { joiningDate: new Date() },
    },
    { new: true, upsert: true, runValidators: true }
  )
    .select("+bankAccountNumber") // Taki response me updated bank account number bhi jaaye
    .populate("user", "name email mobile role");
  // highlight-end

  if (req.file && oldImagePath) {
    deleteLocalFile(oldImagePath);
  }

  res.json({
    message: existingProfile
      ? "Profile updated successfully"
      : "Profile created successfully",
    profile: updatedProfile,
  });
});

/**
 * @route   GET /api/profile/user/:userId
 * @desc    (Admin) Get profile for a specific user by their ID
 * @access  Admin Private
 */
export const getProfileByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid user ID format.");
  }

  const profile = await Profile.findOne({ user: req.params.userId }).populate(
    "user",
    "name email mobile"
  );

  if (!profile) {
    const user = await User.findById(req.params.userId).select(
      "name email mobile createdAt"
    );
    if (!user) {
      res.status(404);
      throw new Error("User not found with the provided ID.");
    }

    return res.json({
      user: user,
      joiningDate: user.createdAt,
      dob: null,
      address: "",
      city: "",
      state: "",
      pincode: "",
      profileImage: null,
      designation: "", // <-- Added
      panNumber: "", // <-- Added
      bankAccountNumber: "", // <-- Added
    });
  }

  res.json(profile);
});
