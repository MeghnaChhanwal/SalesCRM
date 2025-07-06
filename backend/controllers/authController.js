import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Login Controller (check-in + active + break end if open)
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

    // Step 1: Set Active status
    employee.status = "Active";
    await employee.save(); // Step 2: Save to MongoDB

    const date = todayIST();
    const time = timeIST();

    let timing = await Timing.findOne({ employee: employee._id, date });

    if (!timing) {
      // New day – check in
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      // Already exists – resume session
      checkIn: time,
      timing.status = "Active";
      timing.breakStatus = "OffBreak";

      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time; // Auto-end break
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

// ✅ Logout Controller (check-out + break + inactive)
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    employee.status = "Inactive";
    await employee.save();

    const date = todayIST();
    const time = timeIST();

    const timing = await Timing.findOne({ employee: employeeId, date });

    if (timing) {
      timing.checkOut = time;
      timing.status = "Inactive";
      timing.breakStatus = "OnBreak";
      timing.breaks.push({ start: time }); // idle break
      await timing.save();

      res.status(200).json({ message: "Logged out", timing });
    } else {
      res.status(404).json({ error: "Timing record not found for logout" });
    }
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
