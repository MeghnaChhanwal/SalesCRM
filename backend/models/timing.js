import mongoose from "mongoose";

// 🔹 Sub-schema for each break entry (no ObjectId)
const breakSchema = new mongoose.Schema(
  {
    start: {
      type: String, // Format: "HH:MM AM/PM"
      required: true,
    },
    end: {
      type: String, // optional — break may still be ongoing
    },
  },
  { _id: false } // no _id field for subdocs
);

// 🔹 Main schema for daily timing record
const timingSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true, // faster lookup by employee
    },
    date: {
      type: String, // Format: YYYY-MM-DD (IST)
      required: true,
      index: true, // efficient filtering by day
    },
    checkIn: {
      type: String, // e.g. "09:00 AM"
      required: true,
    },
    checkOut: {
      type: String, // e.g. "06:00 PM"
      default: null,
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
    breaks: [breakSchema], // array of breaks
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// 🔹 Optional compound index (if frequently queried together)
timingSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Timing", timingSchema);
