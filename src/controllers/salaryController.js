import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import SalarySlip from "../models/SalarySlip.js";
import User from "../models/userModel.js";
import Profile from "../models/Profile.js";
import Attendance from "../models/Attendance.js";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * @route   GET /api/salary/details/:userId/:month/:year
 * @desc    Admin: Get employee details (profile, attendance) for salary generation
 * @access  Admin Private
 */
export const getEmployeeSalaryDetails = asyncHandler(async (req, res) => {
  const { userId, month, year } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid employee ID format.");
  }

  const user = await User.findById(userId).select("name");
  if (!user) {
    res.status(404);
    throw new Error("Employee not found.");
  }

  const profile = await Profile.findOne({ user: userId }).select(
    "+bankAccountNumber"
  );
  if (!profile) {
    res.status(404);
    throw new Error(
      "Employee profile not found.Please create a profile for this user first."
    );
  }

  const monthIndex = months.indexOf(month);
  if (monthIndex === -1) {
    res.status(400);
    throw new Error("Invalid month name.");
  }

  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

  // --- Naya hissa: Attendance summary ke liye aggregation ka use ---
  const attendanceSummary = await Attendance.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const summaryMap = {
    Present: 0,
    Absent: 0,
    Leave: 0,
  };
  attendanceSummary.forEach((item) => {
    if (item._id in summaryMap) {
      summaryMap[item._id] = item.count;
    }
  });

  const presentDays = summaryMap.Present;
  // Loss of Pay = Absent + Leave (Business logic yahan bhi apply karein)
  const lossOfPayDays = summaryMap.Absent + summaryMap.Leave;

  const response = {
    employeeName: user.name,
    dateOfJoining: profile.joiningDate.toLocaleDateString("en-GB"),
    designation: profile.designation,
    pan: profile.panNumber,
    bankAccountNumber: profile.bankAccountNumber || "N/A",
    presentDays,
    lossOfPayDays,
  };

  res.status(200).json({ success: true, data: response });
});

/**
 * @route   POST /api/salary/create-manual/:userId
 * @desc    Admin: Create a new DRAFT salary slip with manual inputs
 * @access  Admin Private
 */
export const createManualSalarySlip = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    month,
    year,
    presentDays,
    lossOfPayDays,
    basicSalary,
    earnings,
    deductions,
    totalEarnings,
    totalDeductions,
    netSalary,
  } = req.body;

  if (
    !month ||
    !year ||
    basicSalary === undefined ||
    !earnings ||
    !deductions ||
    totalEarnings === undefined ||
    totalDeductions === undefined ||
    netSalary === undefined
  ) {
    res.status(400);
    throw new Error("All salary fields are required.");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("Employee not found.");
  }

  const existingSlip = await SalarySlip.findOne({ user: userId, month, year });
  if (existingSlip) {
    res.status(409); // 409 Conflict is a great status code here
    throw new Error(
      `A salary slip for ${month} ${year} already exists for this employee.`
    );
  }

  const newSlip = new SalarySlip({
    user: userId,
    month,
    year,
    presentDays,
    lossOfPayDays,
    basicSalary,
    earnings,
    deductions,
    totalEarnings,
    totalDeductions,
    netSalary,
    status: "Draft",
  });

  await newSlip.save();
  res.status(201).json({
    message: "Draft salary slip created successfully.",
    data: newSlip,
  });
});

/**
 * @route   PATCH /api/salary/publish/:slipId
 * @desc    Admin: Publish a draft slip to make it visible to the employee
 * @access  Admin Private
 */
export const publishSalarySlip = asyncHandler(async (req, res) => {
  const { slipId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(slipId)) {
    res.status(400);
    throw new Error("Invalid salary slip ID format.");
  }

  const slip = await SalarySlip.findById(slipId);
  if (!slip) {
    res.status(404);
    throw new Error("Salary slip not found.");
  }

  if (slip.status === "Published") {
    res.status(400);
    throw new Error("This salary slip is already published.");
  }

  slip.status = "Published";
  await slip.save();

  res.status(200).json({
    message:
      "Salary slip published successfully! It is now visible to the employee.",
    data: slip,
  });
});

/**
 * @route   GET /api/salary/admin/:userId
 * @desc    Admin: Get all slips (Draft & Published) for a specific user
 * @access  Admin Private
 */
export const getSlipsForAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid user ID format.");
  }

  const slips = await SalarySlip.find({ user: userId }).sort({
    year: -1,
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: slips });
});

/**
 * @route   GET /api/salary/admin/history
 * @desc    Admin: Get a history of ALL published slips, filterable by month and year, with total salary summary.
 * @query   ?month=January&year=2024
 * @access  Admin Private
 */
export const getMonthlyHistoryForAdmin = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    res.status(400);
    throw new Error("Month and year are required as query parameters.");
  }

  const filter = {
    status: "Published",
    month: month,
    year: parseInt(year),
  };

  const history = await SalarySlip.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  const totalPaidSalary = history.reduce(
    (sum, slip) => sum + slip.netSalary,
    0
  );

  res.status(200).json({
    success: true,
    data: {
      slips: history,
      summary: {
        totalEmployeesPaid: history.length,
        totalPaidSalary: parseFloat(totalPaidSalary.toFixed(2)),
        month: month,
        year: year,
      },
    },
  });
});

/**
 * @route   GET /api/salary/employee/my-slips
 * @desc    Employee: Get own PUBLISHED salary slips, optionally filtered by month and year.
 * @query   ?month=January&year=2024 (Optional)
 * @access  Employee Private
 */
export const getMySlipsForEmployee = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;
  const { month, year } = req.query;

  let filter = {
    user: employeeId,
    status: "Published",
  };

  if (month && year) {
    filter.month = month;
    filter.year = parseInt(year);
  }

  const slips = await SalarySlip.find(filter).sort({ year: -1, createdAt: -1 });
  res.status(200).json({ success: true, data: slips });
});
