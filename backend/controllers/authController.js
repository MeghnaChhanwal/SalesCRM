// controllers/authController.js
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

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString();

    let timing = await Timing.findOne({ employee: employee._id, date: today });

    // ❌ Block login if already active on another tab
    if (timing && timing.status === "Active") {
      return res.status(400).json({ error: "This user is already logged in on another device." });
    }

    // ✅ Handle missing break end (if previous break started but not ended)
    if (timing?.breaks?.length > 0) {
      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (!lastBreak.end) {
        lastBreak.end = timeStr;
      }
    }

    // ✅ New or resumed check-in
    if (!timing) {
      timing = new Timing({
        employee: employee._id,
        date: today,
        checkIn: timeStr,
        status: "Active",
      });
    } else {
      timing.checkIn = timeStr;
      timing.checkOut = null;
      timing.status = "Active";
    }

    await timing.save();

    res.status(200).json({
      message: "Login successful",
      user: employee,
      timing,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};
