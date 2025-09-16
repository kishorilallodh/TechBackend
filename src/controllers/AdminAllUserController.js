// controllers/adminController.js

import User from "../models/userModel.js";
import Profile from "../models/Profile.js";
import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import asyncHandler from 'express-async-handler';
/**
 * @route   GET /api/admin/employees
 * @desc    (Admin) Get a list of all employees with their profile info
 * @access  Admin Private
 */
export const getAllEmployees = asyncHandler( async (req, res) => {
  
        // Mongoose Aggregation Pipeline ka use karenge
        const employees = await User.aggregate([
            // Step 1: Sirf 'user' role wale documents ko filter karo
            {
                $match: { role: 'user' }
            },
            // Step 2: 'profiles' collection ke saath join (lookup) karo
            {
                $lookup: {
                    from: 'profiles', // Dusri collection ka naam
                    localField: '_id', // User collection ki field
                    foreignField: 'user', // Profile collection ki field
                    as: 'profileInfo' // Naye array ka naam jisme joined data aayega
                }
            },
            // Step 3: $lookup ek array return karta hai, humein sirf pehla element chahiye
            {
                $unwind: {
                    path: '$profileInfo',
                    preserveNullAndEmptyArrays: true // Agar kisi user ki profile nahi bani, toh bhi use list me rakho
                }
            },
            // Step 4: Final result me kaun-kaun si fields chahiye, woh select karo
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1, // 👈 Role yahan se hata diya gaya hai
                    profileImage: '$profileInfo.profileImage', // Profile se profileImage nikalo
                    joiningDate: '$profileInfo.joiningDate',
                    createdAt: 1 // Fallback joining date
                }
            },
            // Step 5: Naye join hue users ko sabse upar dikhao
            {
                $sort: { createdAt: -1 }
            }
        ]);

        // Fallback for joiningDate
        const employeesWithJoiningDate = employees.map(emp => ({
            ...emp,
            // Agar profile me joiningDate nahi hai, toh user kab create hua tha, woh date use karo
            joiningDate: emp.joiningDate || emp.createdAt 
        }));

        res.status(200).json(employeesWithJoiningDate);

});

/**
 * @route   GET /api/admin/employees/count
 * @desc    (Admin) Get the total count of employees
 * @access  Admin Private
 */
export const getEmployeeCount = asyncHandler(async (req, res) => {
  
        const count = await User.countDocuments({ role: 'user' });
        res.status(200).json({ count });
    
});

/**
 * @route   DELETE /api/admin/employees/:id
 * @desc    (Admin) Delete an employee and their profile
 * @access  Admin Private
 */
export const deleteEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid employee ID." });
    }

    
        // Step 1: User ko delete karo
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "Employee not found." });
        }

        // Step 2: Us user ki profile ko bhi delete karo
        const profile = await Profile.findOneAndDelete({ user: id });
        
        // Optional: User ki profile image ko server se delete karo
        if (profile && profile.profileImage) {
            // Aapka file deletion wala helper function yahan use karein
            // Jaise: deleteLocalFile(path.join('public', profile.profileImage));
        }

        res.status(200).json({ message: "Employee and their profile deleted successfully." });

});


 /**
 * @route   POST /api/admin/employees
 * @desc    (Admin) Create a new employee
 * @access  Admin Private
 */
export const createEmployee = asyncHandler(async (req, res) => {
    const { name, email, mobile, password, role = 'user' } = req.body;

    // Basic validation
     if (!name || !email || !mobile || !password) {
        res.status(400);
        throw new Error("Please provide all required fields: name, email, mobile, and password.");
    }

   
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
        res.status(400); // 400 Bad Request is better than 409 Conflict here for simplicity
        throw new Error("An employee with this email already exists.");
    }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const newUser = await User.create({
            name,
            email,
            mobile,
            password: hashedPassword,
            role, // Admin can set the role, defaults to 'user'
        });
        
        // Response se password hata dein
        if (newUser) {
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            mobile: newUser.mobile,
            role: newUser.role,
            createdAt: newUser.createdAt,
        };
        res.status(201).json({ message: "Employee created successfully.", user: userResponse });
    } else {
        // This is a fallback, User.create itself will throw an error if it fails
        res.status(500);
        throw new Error("Failed to create the employee due to an unexpected error.");
    }
});

export const getAllAdmins = asyncHandler(async (req, res) => {
 
        // Aggregation pipeline bilkul same hai, bas $match condition badal jayegi
        const admins = await User.aggregate([
            // Step 1: Sirf 'admin' role wale documents ko filter karo
            {
                $match: { role: 'admin' }
            },
            // Step 2 to 5 bilkul same rahenge
            {
                $lookup: {
                    from: 'profiles',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'profileInfo'
                }
            },
            {
                $unwind: {
                    path: '$profileInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1,
                    profileImage: '$profileInfo.profileImage',
                    joiningDate: '$profileInfo.joiningDate',
                    createdAt: 1
                }   
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        const adminsWithJoiningDate = admins.map(admin => ({
            ...admin,
            joiningDate: admin.joiningDate || admin.createdAt
        }));

        res.status(200).json(adminsWithJoiningDate);

});