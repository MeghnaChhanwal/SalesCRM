import mongoose from "mongoose";

const breakSchema = new mongoose.Schema({
  start: String,
  end: String,
  date: String,
});

const timingSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    date: String,
    checkIn: String,
    checkOut: String,
    breaks: [breakSchema],
    status: { type: String, enum: ["Active", "Inactive"] },
  },
  { timestamps: true }
);

export default mongoose.model("Timing", timingSchema);