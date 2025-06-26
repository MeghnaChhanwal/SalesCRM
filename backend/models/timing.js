import mongoose from "mongoose";

const breakSchema = new mongoose.Schema({
  start: { type: String }, // "HH:mm:ss" format
  end: { type: String }    // "HH:mm:ss" format
}, { _id: false });

const timingSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  checkIn: {
    type: String // Format: HH:mm:ss
  },
  checkOut: {
    type: String // Format: HH:mm:ss
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Inactive"
  },
  breakStatus: {
    type: String,
    enum: ["OnBreak", "OffBreak"],
    default: "OffBreak"
  },
  breaks: [breakSchema]
}, { timestamps: true });

export default mongoose.model("Timing", timingSchema);
