import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Login Controller (Check-in or Resume)
export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (employee.lastName.toLowerCase() !== password.toLowerCase())
      return res.status(401).json({ error: "Invalid credentials" });

    if (employee.status === "Active")
      return res.status(403).json({ error: "Already logged in from another device or tab" });

    // ✅ Mark employee as Active
    employee.status = "Active";
    await employee.save();

    // ✅ Handle check-in or resume
    const date = todayIST();
    const time = timeIST();

    let timing = await Timing.findOne({ employee: employee._id, date });

    if (!timing) {
      // First login of the day
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      // Relogin: update check-in and resume break if needed
      timing.checkIn = time;
      timing.status = "Active";

      const lastBreak = timing.breaks.length > 0
        ? timing.breaks[timing.breaks.length - 1]
        : null;

      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
        timing.breakStatus = "OffBreak";
      }
    }

    await timing.save();

    res.status(200).json({
      message: "Login successful",
      employeeId: employee._id,
      name: employee.firstName,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ Logout Controller (on tab close)
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // ✅ Mark employee as Inactive
    employee.status = "Inactive";
    await employee.save();

    // ✅ Handle final check-out and break start
    const date = todayIST();
    const time = timeIST();

    const timing = await Timing.findOneAndUpdate(
      { employee: employeeId, date, checkOut: { $exists: false } },
      {
        checkOut: time,
        status: "Inactive",
        breakStatus: "OnBreak",
        $push: { breaks: { start: time } },
      },
      { new: true }
    );

    res.status(200).json({ message: "Logged out successfully", timing });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
