import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// Login Controller (checkin + active + break end if any)
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

    // Set employee active
    employee.status = "Active";
    await employee.save();

    const date = todayIST();
    const time = timeIST();

    let timing = await Timing.findOne({ employee: employee._id, date });

    if (!timing) {
      // New timing record for today with checkIn and active status
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      // Update existing timing: active + end last break if ongoing
      timing.status = "Active";
      timing.breakStatus = "OffBreak";

      const lastBreak = timing.breaks.length
        ? timing.breaks[timing.breaks.length - 1]
        : null;

      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time; // break ended on login
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

// Logout Controller (checkout + break start + inactive)
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    // Set employee inactive
    employee.status = "Inactive";
    await employee.save();

    const date = todayIST();
    const time = timeIST();

    // Update today's timing: add checkout, inactive status, start new break
    const timing = await Timing.findOne({ employee: employeeId, date });

    if (timing) {
      timing.checkOut = time;
      timing.status = "Inactive";
      timing.breakStatus = "OnBreak";
      timing.breaks.push({ start: time }); // break started on logout
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