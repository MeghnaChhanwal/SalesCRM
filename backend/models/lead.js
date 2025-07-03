import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Lead name is required"],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  receivedDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Ongoing", "Closed"],  // match your UI
    default: "Ongoing",
  },
  type: {
    type: String,
    enum: ["Hot", "Warm", "Cold"],
    default: "Warm",
  },
  language: {
    type: String,
    required: [true, "Language is required"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  scheduledCalls: [
    {
      callDate: {
        type: Date,
        required: true,
      },
      callType: {
        type: String,
        enum: ["Referral", "Cold Call", "Follow Up"],
        required: true,
      },
    }
  ]
}, {
  timestamps: true
});

export default mongoose.model("Lead", leadSchema);
