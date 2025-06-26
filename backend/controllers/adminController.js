import Admin from "../models/admin.js";

export const updateAdminProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const admin = await Admin.findOneAndUpdate(
      { email }, // find by email or ID
      { firstName, lastName, password },
      { new: true, upsert: true } // update or insert if not found
    );

    res.status(200).json({ message: "Profile updated", admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
