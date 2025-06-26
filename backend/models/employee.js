import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    location: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Inactive" },
    assignedLeads: { type: Number, default: 0 },
    closedLeads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);