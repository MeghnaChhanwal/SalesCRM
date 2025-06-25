import Employee from "../models/employee.js";
import Timing from "../models/timing.js";

export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (employee.lastName.toLowerCase() !== password.toLowerCase()) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const today = new Date().toISOString().split("T")[0];
    const timing = await Timing.findOne({ employee: employee._id, date: today });

    // ✅ Block login if still active
    if (timing && timing.status === "Active") {
      return res.status(400).json({ error: "User already active on another device." });
    }

    res.status(200).json({ user: employee });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};