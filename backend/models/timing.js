import mongoose from "mongoose";

const breakSchema = new mongoose.Schema({
  start: { type: String },  // time string (e.g., "11:00:00")
  end: { type: String },    // time string (e.g., "11:30:00")
}, { _id: false });

const timingSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: true,
  },
  checkIn: {
    type: String, // Format: "HH:mm:ss"
  },
  checkOut: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Inactive",
  },
  breakStatus: {
    type: String,
    enum: ["OnBreak", "OffBreak"],
    default: "OffBreak",
  },
  breaks: [breakSchema],
}, { timestamps: true });

export default mongoose.model("Timing", timingSchema);
