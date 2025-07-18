import mongoose from "mongoose";

const breakSchema = new mongoose.Schema(
  {
    start: {
      type: String, 
      required: true,
    },
    end: {
      type: String, 
    },
  },
  { _id: false }
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
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    checkIn: {
      type: String, // "HH:MM AM/PM"
      required: true,
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
    breakStatus: {
      type: String,
      enum: ["OnBreak", "OffBreak", "CheckedOut"], 
    },
    breaks: [breakSchema],
  },
  {
    timestamps: true,
  }
);

timingSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Timing", timingSchema);
