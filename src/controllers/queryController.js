import Query from "../models/query.js";
import mongoose from 'mongoose';
import asyncHandler from "express-async-handler";
import {
  sendQueryConfirmation,
  sendQueryAdminNotification,
  sendAdminReplyToQuery,
} from "../utils/emailService.js";

// @desc    Submit a new contact query (Public)
// @route   POST /api/queries
export const submitQuery = asyncHandler(async (req, res) => {
  const { name, email, phone, company, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Name, email, and message are required fields.");
  }

  const newQuery = await Query.create({ name, email, phone, company, message });

  // Emails bhejein
  sendQueryConfirmation(email, name).catch(console.error);
  sendQueryAdminNotification(newQuery).catch(console.error);

  res
    .status(201)
    .json({ message: "Your query has been submitted successfully!" });
});

// @desc    Get all queries for the admin panel (Admin)
// @route   GET /api/queries/admin/all
export const getAllQueries = asyncHandler(async (req, res) => {
  const queries = await Query.find({}).sort({ createdAt: -1 });
  res.status(200).json(queries);
});

// @desc    Admin replies to a query (Admin)
// @route   POST /api/queries/:id/reply
export const replyToQuery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body; // Admin ka reply

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid query ID format.");
  }
  if (!replyMessage) {
    res.status(400);
    throw new Error("Reply message cannot be empty.");
  }

  const query = await Query.findById(id);
  if (!query) {
    res.status(404);
    throw new Error("Query not found with the provided ID.");
  }

  // User ko email bhejein
  await sendAdminReplyToQuery(
    query.email,
    query.name,
    query.message,
    replyMessage
  );

  // Database me status update karein
  query.status = "Replied";
  await query.save();

  res.status(200).json({ message: "Reply sent successfully." });
});

// @desc    Delete a query (Admin)
// @route   DELETE /api/queries/:id
export const deleteQuery = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid query ID format.");
  }

  const query = await Query.findByIdAndDelete(id);
  if (!query) {
    res.status(404);
    throw new Error("Query not found with the provided ID.");
  }

  res.status(200).json({ message: "Query deleted successfully." });
});
