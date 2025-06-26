// controllers/authController.js
import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ LOGIN CONTROLLER
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
      return res.status(403).json({ error: "Already logged in from another device or tab" });

    // ✅ Set employee status to Active
    employee.status = "Active";
    await employee.save();

    const today = todayIST();
    const time = timeIST();

    // ✅ Find today's timing
    let timing = await Timing.findOne({ employee: employee._id, date: today });

    let message = "";

    if (!timing) {
      // First login of the day
      timing = await Timing.create({
        employee: employee._id,
        date: today,
        checkin: time,
        status: "Active",
        break: [],
      });
      message = `Checked in at ${time}`;
    } else {
      // Already checked in, check if last break is ongoing
      const latestBreak = timing.break.at(-1);
      if (latestBreak && !latestBreak.end) {
        latestBreak.end = time;
        message = `Break ended at ${time}`;
      } else {
        message = "Already checked in";
      }

      timing.status = "Active";
      await timing.save();
    }

    return res.status(200).json({
      message: `Login successful - ${message}`,
      employeeId: employee._id,
      name: employee.firstName,
      checkin: timing.checkin,
      status: timing.status,
      break: timing.break,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ LOGOUT CONTROLLER (on tab close)
export const logoutEmployee = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const time = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      return res.status(404).json({ message: "No check-in found today!" });
    }

    if (timing.checkout) {
      return res.status(400).json({ message: "Already checked out" });
    }

    // ✅ Set checkout time and push break (with only start)
    timing.checkout = time;
    timing.status = "Inactive";
    timing.break.push({ start: time });
    await timing.save();

    await Employee.findByIdAndUpdate(employeeId, { status: "Inactive" });

    res.status(200).json({ message: "Logged out successfully", timing });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
