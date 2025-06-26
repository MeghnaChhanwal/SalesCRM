import mongoose from "mongoose";

const breakSchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // e.g. "01:00:00 PM"
    end: { type: String },                   // optional while break ongoing
    date: { type: String },                  // optional if all breaks are same day
  },
  { _id: false } // No need for _id in subdocuments
);

const timingSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD" format
      required: true,
    },
    checkIn: {
      type: String, // "HH:mm:ss AM/PM"
      default: null,
    },
    checkOut: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
    breaks: [breakSchema],
  },
  { timestamps: true }
);

// ✅ Ensure one entry per employee per day
timingSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Timing", timingSchema);
