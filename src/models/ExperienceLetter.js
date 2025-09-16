import mongoose from 'mongoose';

const experienceLetterSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        recipientName: {
            type: String,
            required: true,
        },
        issueDate: {
            type: Date,
            required: [true, 'Please specify the issue date'],
        },
        position: {
            type: String,
            required: [true, 'Please specify the position'],
        },
        duration: { // e.g., "2 years and 6 months"
            type: String,
            required: [true, 'Please specify the duration'],
        },
        timePeriod: { // e.g., "January 2023 to August 2025"
            type: String,
            required: [true, 'Please specify the time period'],
        },
        letterNumber: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

const ExperienceLetter = mongoose.model('ExperienceLetter', experienceLetterSchema);
export default ExperienceLetter;