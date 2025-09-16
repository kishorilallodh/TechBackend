import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, "Phone number is required."],
        trim: true,
    },
    company: {
        type: String,
        trim: true,
    },
    message: {
        type: String,
        required: [true, "Message is required."],
        trim: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Replied'],
        default: 'Pending'
    }
}, { timestamps: true }); // `createdAt` field apne aap aa jayegi

export default mongoose.model("Query", querySchema);