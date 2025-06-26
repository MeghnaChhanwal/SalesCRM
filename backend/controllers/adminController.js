import Admin from "../models/admin.js";

export const updateAdminProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required to update profile." });
    }

    // Optional: validate input further if needed

    const updatedAdmin = await Admin.findOneAndUpdate(
      { email },
      { firstName, lastName, password },
      { new: true, upsert: true } // new returns updated doc, upsert creates if not found
    );

    res.status(200).json({
      message: "Admin profile updated successfully.",
      admin: updatedAdmin,
    });
  } catch (err) {
    console.error("Admin update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
