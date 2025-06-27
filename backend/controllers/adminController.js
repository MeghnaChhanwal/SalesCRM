// backend/controllers/adminController.js
import Admin from "../models/admin.js";
import bcrypt from "bcrypt";

export const updateAdminProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Assuming you have only one admin
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.firstName = firstName;
    admin.lastName = lastName;
    admin.email = email;

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
    }

    await admin.save();
    res.json({ message: "Profile updated successfully", admin });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
