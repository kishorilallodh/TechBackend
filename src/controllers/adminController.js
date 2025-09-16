// controllers/adminController.js
import bcrypt from "bcryptjs";
import mongoose from 'mongoose';
import User from "../models/userModel.js";
import asyncHandler from 'express-async-handler';
// ✅ Create a New Admin (Only accessible by other admins)
export const createAdmin = asyncHandler(async (req, res) => {
  
    // 1. Naye admin ki details request body se lein
    const { name, mobile, email, password } = req.body;

    if (!name || !email || !mobile || !password) {
        res.status(400);
        throw new Error("Please provide all required fields: name, email, mobile, and password.");
    }

    // 2. Check karein ki email pehle se exist to nahi karta
    const userExists = await User.findOne({ email });
     if (userExists) {
        res.status(400); // Bad Request
        throw new Error("An admin with this email already exists.");
    }


    // 3. Password ko hash karein
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Naya user create karein aur role ko explicitly 'admin' set karein
    const newAdmin = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
      role: 'admin' // Yahan role ko hardcode karna zaroori hai
    });

    // 5. Success response bhejein
    if (newAdmin) {
        res.status(201).json({
            message: "Admin user created successfully",
            user: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });
    } else {
        // Fallback error, though User.create() usually throws its own error
        res.status(500);
        throw new Error("Failed to create the admin user.");
    }

});