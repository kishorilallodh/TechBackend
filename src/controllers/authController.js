// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/emailService.js";
import asyncHandler from "express-async-handler";

const generateToken = (res, user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // save token in cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only https in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

// ✅ Signup
// controllers/authController.js

export const register = asyncHandler(async (req, res) => {
  const { name, mobile, email, password } = req.body;
  // ... user existence check and hashing ...
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400); // 1. Status code set karein
    throw new Error("User with this email already exists"); // 2. Error throw karein
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    mobile,
    email,
    password: hashedPassword,
  });

  if (newUser) {
    const token = generateToken(res, newUser);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
        token: token,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// ✅ Login
// controllers/authController.js

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // ... user check and password compare ...
  const user = await User.findOne({ email });

  // Yahan dono conditions ko ek saath check kar sakte hain
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(res, user);
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        token: token,
      },
    });
  } else {
    res.status(401); // 401 Unauthorized zyada aacha status code hai login failure ke liye
    throw new Error("Invalid email or password");
  }
});

// ✅ Logout
export const logout = asyncHandler(async (req, res) => {
  // Agar req.user middleware se aa raha hai, toh extra cleanup karein
  if (req.user) {
    const user = await User.findById(req.user.id);
    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }
  }

  // Cookie ko clear karein
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Set expiry date to the past
  });

  res.status(200).json({ message: "Logged out successfully" });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate a password reset token and send it to the user's email
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user found with that email address.");
  }

  // 1. Reset token generate karein
  const resetToken = crypto.randomBytes(20).toString("hex");

  // 2. Token ko hash karke DB me save karein (security ke liye)
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  await sendPasswordResetEmail(user.email, resetToken);
  res
    .status(200)
    .json({ message: "A password reset link has been sent to your email." });
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset the user's password using the token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  // 1. URL se mile token ko hash karein taaki DB se match kar sakein
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2. User ko token aur expiry date se dhoondhein
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Token expire na hua ho
  });

    if (!user) {
        // Step 1: Set the status code for the response. 400 (Bad Request) is appropriate.
        res.status(400); 
        // Step 2: Throw a new Error. asyncHandler will catch this and pass it to your central errorHandler.
        throw new Error("Password reset token is invalid or has expired.");
    }

  // 3. Naya password set karein
  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4. Naya login token generate karke user ko login karwa dein
  // generateToken(res, user);

  res.status(200).json({ message: "Password reset successful. Please log in with your new password." });
});
