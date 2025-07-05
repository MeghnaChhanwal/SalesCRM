import mongoose from "mongoose";

const timingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  checkIn: String,
  checkOut: String,
  status: { type: String, enum: ["Active", "Inactive"] },
  breakStatus: { type: String, enum: ["OnBreak", "OffBreak"] },
  breaks: [{ start: String, end: String }],
});

const Timing = mongoose.model("Timing", timingSchema);

export default Timing; // ✅ This makes `import Timing from ...` work
