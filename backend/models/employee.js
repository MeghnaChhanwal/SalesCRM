import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  language: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  status: { type: String, default: "Inactive" },
  assignedLeads: { type: Number, default: 0 },
  closedLeads: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
