import mongoose from "mongoose";

const breakSchema = new mongoose.Schema({
  start: String,
  end: String,
});

const timingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  date: String,            // e.g., '2025-06-26'
  checkIn: String,         // e.g., '09:30:00'
  checkOut: String,        // e.g., '18:30:00'
  status: String,          // "Active" / "Inactive"
  breaks: [breakSchema],   // renamed from 'break' to 'breaks'
});

export default mongoose.model("Timing", timingSchema);
