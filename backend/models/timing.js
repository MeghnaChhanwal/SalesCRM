import mongoose from "mongoose";

const timingSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId, // 🔗 Links to Employee _id
    ref: "Employee",
    required: true,
  },
  date: {
    type: String, // e.g. "2025-06-25"
    required: true,
  },
  checkIn: String,    // e.g. "10:00:00 AM"
  checkOut: String,   // e.g. "06:00:00 PM"
  status: String,     // "Active", "Inactive"
  breaks: [
    {
      start: String,  // e.g. "01:00:00 PM"
      end: String,    // e.g. "01:30:00 PM"
      date: String,   // Optional: useful for multiple-day logs
    }
  ],
});

export default mongoose.model("Timing", timingSchema);
