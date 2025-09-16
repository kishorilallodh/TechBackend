import mongoose from 'mongoose';

const SalaryItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
}, { _id: false });

const salarySlipSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft',
    },
    presentDays: { type: Number, required: true },
    lossOfPayDays: { type: Number, required: true },
    basicSalary: { type: Number, required: true, default: 0 },
    earnings: [SalaryItemSchema],
    deductions: [SalaryItemSchema],
    totalEarnings: { type: Number, required: true },
    totalDeductions: { type: Number, required: true },
    netSalary: { type: Number, required: true },
}, { timestamps: true });

salarySlipSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('SalarySlip', salarySlipSchema);