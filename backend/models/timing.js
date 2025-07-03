import mongoose from "mongoose";

const breakSchema = new mongoose.Schema(
  {
    start: { type: Date },
    end: { type: Date },
  },
  { _id: false }
);

const timingSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    checkIn: Date,
    checkOut: Date,
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
  { timestamps: true }
);

// ✅ Final export
const Timing = mongoose.model("Timing", timingSchema);
export default Timing;
