// backend/models/lead.js
import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  receivedDate: Date,
  status: String,
  type: String,
  language: String,
  location: String,
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee"
  }
});

export default mongoose.model("Lead", leadSchema);
