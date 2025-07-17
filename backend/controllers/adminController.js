import Admin from "../models/admin.js";
import bcrypt from "bcrypt";

// GET: Fetch admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne().select("-password");
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(admin);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT: Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const admin = await Admin.findOne();
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    admin.firstName = firstName;
    admin.lastName = lastName;
    admin.email = email;

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
    }

    await admin.save();

    const { password: _, ...safeAdmin } = admin._doc;
    res.json({ message: "Profile updated successfully", admin: safeAdmin });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
