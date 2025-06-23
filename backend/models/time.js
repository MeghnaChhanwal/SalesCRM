import mongoose from "mongoose";

const breakSchema = new mongoose.Schema({
  start: String,
  end: String,
  date: String,
});

const timingSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: { type: String, required: true },
  checkIn: String,
  checkOut: String,
  breaks: [breakSchema],
  isActive: { type: Boolean, default: false },  // ✅ Login status
  isOnBreak: { type: Boolean, default: false }, // ✅ Break status
});

export default mongoose.model("Timing", timingSchema);
