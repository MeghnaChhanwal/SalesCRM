import mongoose from "mongoose";

const breakSchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // HH:MM AM/PM (IST)
    end: { type: String }, // can be empty if break is ongoing
  },
  { _id: false } // no ObjectId for subdocument
);

const timingSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD (IST)
      required: true,
      index: true,
    },
    checkIn: {
      type: String, // e.g., "09:45 AM"
      required: true,
    },
    checkOut: {
      type: String, // e.g., "06:15 PM"
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Timing", timingSchema);
