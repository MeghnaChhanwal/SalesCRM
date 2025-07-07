
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String, // hashed
});

export default mongoose.model("Admin", adminSchema);
