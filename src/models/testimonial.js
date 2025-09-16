import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
        trim: true,
    },
    review: {
        type: String,
        required: [true, "Review text is required."],
        trim: true,
    },
    rating: {
        type: Number,
        required: [true, "Rating is required."],
        min: 1,
        max: 5,
    },
    avatar: {
        type: String, // Path to the uploaded image
        required: [true, "Avatar image is required."],
    },
    isPublished: {
        type: Boolean,
        default: true, // Taki naya testimonial by default website par dikhe
    },
}, { timestamps: true });

export default mongoose.model("Testimonial", testimonialSchema);