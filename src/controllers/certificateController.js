// controllers/certificateController.js
import mongoose from 'mongoose';
import CertificateRequest from "../models/CertificateRequest.js";
import { generateCertificateNumber } from "../utils/generateCertificateNumber.js";
import asyncHandler from "express-async-handler";
// @desc    User submits a new certificate request
// @route   POST /api/certificates/request
// @access  Private (User)
export const submitRequest = asyncHandler(async (req, res) => {
  // 1. startDate ko req.body se nikaalein
  const {
    certificateType,
    nameOnCertificate,
    courseName,
    startDate,
    completionDate,
    duration,
    message,
  } = req.body;

  if (
    !certificateType ||
    !nameOnCertificate ||
    !courseName ||
    !completionDate
  ) {
    res.status(400);
    throw new Error(
      "Certificate type, name, course, and completion date are required fields."
    );
  }

  const newRequest = new CertificateRequest({
    user: req.user.id, // Auth middleware se user ki ID milegi
    certificateType,
    nameOnCertificate,
    courseName,
    // 2. Naye request object mein startDate ko add karein
    startDate,
    completionDate,
    duration,
    message,
  });

  const savedRequest = await newRequest.save();
  res
    .status(201)
    .json({
      message: "Request submitted successfully!",
      request: savedRequest,
    });
});

// @desc    Get all requests for the logged-in user
// @route   GET /api/certificates/my-requests
// @access  Private (User)
export const getUserRequests = asyncHandler(async (req, res) => {
  const requests = await CertificateRequest.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  res.status(200).json(requests);
});

// @desc    (Admin) Get all certificate requests from all users
// @route   GET /api/certificates/admin/all
// @access  Private (Admin)
export const getAllRequestsForAdmin = asyncHandler(async (req, res) => {
  const requests = await CertificateRequest.find({})
    .populate("user", "name email") // User ka naam aur email bhi saath mein bhejenge
    .sort({ createdAt: -1 });
  res.status(200).json(requests);
});

// @desc    (Admin) Update the status of a request
// @route   PUT /api/certificates/admin/update/:id
// @access  Private (Admin)
export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, adminRemarks } = req.body;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid request ID format.");
  }

  // Validate status
  if (status && !["Approved", "Rejected"].includes(status)) {
    res.status(400);
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const request = await CertificateRequest.findById(id);

  if (!request) {
    return res.status(404).json({ message: "Request not found." });
  }
  // Number tabhi generate hoga jab status 'Approved' ho raha ho aur pehle se 'Approved' na ho.
  if (status === "Approved" && request.status !== "Approved") {
    // Hamare helper function ko call karein
    request.certificateNumber = await generateCertificateNumber();
  }
  // ==============================

  request.status = status || request.status;
  request.adminRemarks = adminRemarks || request.adminRemarks;

  const updatedRequest = await request.save();
  res
    .status(200)
    .json({ message: "Status updated successfully!", request: updatedRequest });
});

// @desc    (Admin) Delete a certificate request
// @route   DELETE /api/certificates/admin/delete/:id
// @access  Private (Admin)
export const deleteRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid request ID format.");
  }

  const request = await CertificateRequest.findById(id);

  if (!request) {
    res.status(404);
    throw new Error("Certificate request not found.");
  }

  await CertificateRequest.findByIdAndDelete(id);

  res.status(200).json({
    message: "Request deleted successfully!",
    id
  });
});


// @desc    (Public) Verify a certificate by its number and the recipient's name
// @route   POST /api/certificates/verify
// @access  Public
export const verifyCertificate = asyncHandler(async (req, res) => {
  const { certificateNumber, nameOnCertificate } = req.body;

  // Basic validation
  if (!certificateNumber || !nameOnCertificate) {
    res.status(400);
    throw new Error(
      "Certificate number and name are required for verification."
    );
  }

  // Find the certificate in the database
  // IMPORTANT: We check for 'Approved' status to prevent verifying pending requests.
  // We also use a case-insensitive regex for the name to be more user-friendly.
  const certificate = await CertificateRequest.findOne({
    certificateNumber: certificateNumber.trim(),
    nameOnCertificate: {
      $regex: new RegExp(`^${nameOnCertificate.trim()}$`, "i"),
    },
    status: "Approved",
  });

  if (!certificate) {
    res.status(404);
    throw new Error(
      "Verification failed. The certificate number or name does not match an approved record."
    );
  }

  // If found, return the certificate data
  res.status(200).json(certificate);
});
