import mongoose from "mongoose";

const breakSchema = new mongoose.Schema({
  start: { type: String },
  end: { type: String },
}, { _id: false });

const timingSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  checkIn: {
    type: String,
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
  breaks: {
    type: [breakSchema],
    default: [],
  },
}, {
  timestamps: true,
});

export default mongoose.model("Timing", timingSchema);
