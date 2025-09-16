// models/Profile.js
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Link to User model
        required: true
    },
    // 👇 YEH NAYA FIELD ADD KIYA GAYA HAI 👇
    joiningDate: {
        type: Date,
        default: Date.now // Default value set kar di, jo document create hone par apply hogi
    },
    dob: {
        type: Date,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    pincode: {
        type: String,
    },
    profileImage: {
        type: String, 
    },
     designation: {
        type: String,
        trim: true, // Shuru aur aakhir ke extra spaces hata dega
    },
    panNumber: {
        type: String,
        unique: true, // Ek PAN number ek hi user ka ho sakta hai
        sparse: true,
        uppercase: true, // 'abcde1234f' ko 'ABCDE1234F' me save karega
        trim: true,
        // PAN card ke format ko validate karne ke liye Regex
        match: [/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Please fill a valid PAN number'], 
    },
    bankAccountNumber: {
        type: String,
        trim: true,
        select: false,
    },
}, { timestamps: true });

export default mongoose.model("Profile", profileSchema);