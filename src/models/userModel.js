// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [ // Email format check karne ke liye
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    mobile: {
        type: String,
        required: [true, 'Please provide a mobile number'],
        unique: true,
        maxlength: [10, 'Mobile number cannot be longer than 10 digits']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Sirf ye do values ho sakti hain
        default: 'user'
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });

export default mongoose.model("User", userSchema);