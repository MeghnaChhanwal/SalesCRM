// controllers/employeeController.js
import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Login Controller (Check-in + status: Active + break end if pending)
export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const employee = await Employee.findOne({ email });
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    if (employee.lastName.toLowerCase() !== password.toLowerCase())
      return res.status(401).json({ error: "Invalid credentials" });

    if (employee.status === "Active")
      return res.status(403).json({ error: "Already logged in" });

    // ✅ Set employee as active
    employee.status = "Active";
    await employee.save();

    const date = todayIST(); // string format: YYYY-MM-DD
    const time = timeIST();

    let timing = await Timing.findOne({ employee: employee._id, date });

    if (!timing) {
      // New timing record for today
      timing = new Timing({
        employee: employee._id,
        date, // store as string
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      // Update existing timing
      timing.status = "Active";
      timing.breakStatus = "OffBreak";
      timing.checkIn = time;

      const lastBreak = timing.breaks.length
        ? timing.breaks[timing.breaks.length - 1]
        : null;

      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time; // end pending break
      }
    }

    await timing.save();

    const { password: pwd, ...empData } = employee.toObject();
    res.status(200).json(empData);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ Logout Controller (Check-out + status: Inactive + break start)
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    // ✅ Set employee as inactive
    employee.status = "Inactive";
    await employee.save();

    const date = todayIST(); // string format
    const time = timeIST();

    // ✅ Find today's timing record
    const timing = await Timing.findOne({ employee: employeeId, date });

    if (!timing) {
      return res.status(404).json({ error: "Timing record not found for today" });
    }

    // ✅ Update timing record
    timing.checkOut = time;
    timing.status = "Inactive";
    timing.breakStatus = "OnBreak";
    timing.breaks.push({ start: time });

    await timing.save();

    res.status(200).json({ message: "Logged out", timing });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
