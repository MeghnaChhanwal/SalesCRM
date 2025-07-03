import mongoose from "mongoose";

const breakSchema = new mongoose.Schema({
  start: String,
  end: String,
});

const timingSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    date: String, // YYYY-MM-DD
    checkIn: String,
    checkOut: String,
    status: { type: String, default: "Inactive" },
    breakStatus: { type: String, default: "OffBreak" },
    breaks: [breakSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Timing", timingSchema);
