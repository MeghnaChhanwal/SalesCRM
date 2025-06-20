import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  receivedDate: { type: Date, default: Date.now },
  status: { type: String, default: "Open" },
  type: { type: String, default: "Warm" },
  language: String,
  location: String,
  assignedEmployee: { type: String, default: null }
});

export default mongoose.model("Lead", leadSchema);
