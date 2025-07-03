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
    enum: ["Ongoing", "Closed"],  // ✅ correct options for filtering
    default: "Ongoing",
  },
  type: {
    type: String,
    enum: ["Hot", "Warm", "Cold"], // ✅ call logic will use this
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
        enum: ["Referral", "Cold Call"], // ✅ conditional logic handled in controller
        required: true,
      },
    }
  ]
}, {
  timestamps: true, // ✅ auto adds createdAt and updatedAt
});

export default mongoose.model("Lead", leadSchema);
