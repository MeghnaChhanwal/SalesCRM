import mongoose from "mongoose";

const scheduledCallSchema = new mongoose.Schema(
  {
    callDate: {
      type: Date,
      required: [true, "Call date is required"],
    },
    callType: {
      type: String,
      enum: ["Referral", "Cold Call"],
      required: [true, "Call type is required"],
    },
  },
  { _id: false } // Prevent automatic _id for each subdocument
);

const leadSchema = new mongoose.Schema(
  {
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
      enum: ["Ongoing", "Closed"],
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
    scheduledCalls: {
      type: [scheduledCallSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export default mongoose.model("Lead", leadSchema);