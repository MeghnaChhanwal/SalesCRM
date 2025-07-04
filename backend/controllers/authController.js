import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ⏰ LOGIN CONTROLLER
export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const employee = await Employee.findOne({ email });
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    if (employee.lastName.toLowerCase() !== password.toLowerCase())
      return res.status(401).json({ error: "Invalid credentials" });

    // Prevent double login
    if (employee.status === "Active")
      return res.status(403).json({ error: "Already logged in on another device" });

    // Update employee status to active
    employee.status = "Active";
    await employee.save();

    const date = todayIST();
    const time = timeIST();

    let timing = await Timing.findOne({ employee: employee._id, date });

    if (!timing) {
      // Create new timing if not found
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      // Resume timing (e.g., if app crashed)
      timing.status = "Active";
      timing.breakStatus = "OffBreak";

      if (!timing.checkIn) {
        timing.checkIn = time;
      }

      // If last break was not ended, end it now
      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
      }
    }

    await timing.save();

    const { password: _, ...empData } = employee.toObject();
    res.status(200).json(empData);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ⛔ LOGOUT CONTROLLER
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    // Set status to inactive
    employee.status = "Inactive";
    await employee.save();

    const date = todayIST();
    const time = timeIST();

    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing)
      return res.status(404).json({ error: "No timing record found" });

    // Set checkout and break info
    if (!timing.checkOut) timing.checkOut = time;
    timing.status = "Inactive";
    timing.breakStatus = "OffBreak";

    // If last break started but not ended, close it
    const lastBreak = timing.breaks[timing.breaks.length - 1];
    if (lastBreak && !lastBreak.end) {
      lastBreak.end = time;
    }

    await timing.save();

    res.status(200).json({ message: "Logged out successfully", timing });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
