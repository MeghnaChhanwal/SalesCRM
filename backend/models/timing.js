import mongoose from "mongoose";

// ✅ Break sub-schema
const breakSchema = new mongoose.Schema({
  start: { type: String }, // Format: "HH:mm:ss"
  end:   { type: String }  // Format: "HH:mm:ss"
}, { _id: false });

// ✅ Main Timing schema
const timingSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: true
  },
  checkIn: {
    type: String // Format: "HH:mm:ss"
  },
  checkOut: {
    type: String // Format: "HH:mm:ss"
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Inactive"
  },
  breakStatus: {
    type: String,
    enum: ["OnBreak", "OffBreak"],
    default: "OffBreak"
  },
  breaks: [breakSchema]
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// ✅ Export model using ES Modules
const Timing = mongoose.model("Timing", timingSchema);
export default Timing;
