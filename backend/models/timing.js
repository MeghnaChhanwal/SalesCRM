import mongoose from "mongoose";

const breakSchema = new mongoose.Schema({
  start: String,
  end: String,
});

const timingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  date: String,
  checkin: String,
  checkout: String,
  status: String,
  break: [breakSchema],
});

export default mongoose.model("Timing", timingSchema);
