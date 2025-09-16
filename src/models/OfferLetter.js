import mongoose from 'mongoose';

const offerLetterSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        recipientName: { // Storing the name directly for historical accuracy
            type: String,
            required: true,
        },
        position: {
            type: String,
            required: [true, 'Please specify the position'],
        },
        joiningDate: {
            type: Date,
            required: [true, 'Please specify the joining date'],
        },
        letterNumber: { // Unique identifier
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

const OfferLetter = mongoose.model('OfferLetter', offerLetterSchema);
export default OfferLetter;