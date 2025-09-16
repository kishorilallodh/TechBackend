// models/Technology.js (UPDATED & SIMPLIFIED)

import mongoose from 'mongoose';

const technologySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Technology name is required.'], 
        unique: true,
        trim: true 
    },
    // Icon ka naam string ke roop me save karein, jise frontend me dynamically render kiya jayega
    iconString: { 
        type: String,
        required: [true, 'Icon string (e.g., "FaReact") is required.']
    },
    // Tailwind CSS class ko save karein
    colorClass: { 
        type: String,
        default: 'text-gray-500' // Default color agar koi select na ho
    },
     category: {
      type: String,
      enum: ["firstRow", "secondRow"], // 👈 enum declared
      default: "firstRow",
    },
}, { timestamps: true });

export default mongoose.model('Technology', technologySchema);