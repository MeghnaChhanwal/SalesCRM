// controllers/authController.js

import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ LOGIN CONTROLLER
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const employee = await Employee.findOne({ email });
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    if (employee.lastName.toLowerCase() !== password.toLowerCase())
      return res.status(401).json({ error: "Invalid credentials" });

    // ✅ Mark as active
    employee.status = "Active";
    await employee.save();

    const date = todayIST();
    const time = new Date();

    // ✅ Check if already logged in today (but not checked out)
    let timing = await Timing.findOne({
      employee: employee._id,
      date,
      checkOut: { $exists: false },
    });

    if (!timing) {
      // First login of the day or after logout
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      // Already active session — resume
      timing.status = "Active";

      const lastBreak = timing.breaks?.[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
        timing.breakStatus = "OffBreak";
      }
    }

    await timing.save();

    res.status(200).json({
      message: "Login successful",
      employee: {
        _id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        status: employee.status,
      },
    });
  } catch (error) {
    console.error("❌ Auth Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ LOGOUT CONTROLLER
export const logout = async (req, res) => {
  const { id: employeeId } = req.params;

  if (!employeeId || employeeId === "undefined")
    return res.status(400).json({ error: "Invalid or missing employee ID" });

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    // Mark as inactive
    employee.status = "Inactive";
    await employee.save();

    const date = todayIST();
    const time = new Date();

    const timing = await Timing.findOne({
      employee: employeeId,
      date,
      checkOut: { $exists: false },
    });

    if (timing) {
      // ✅ End ongoing break (if any)
      const lastBreak = timing.breaks?.[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
      }

      // ✅ Log checkout
      timing.checkOut = time;
      timing.status = "Inactive";
      timing.breakStatus = "OffBreak";

      await timing.save();
    }

    res.status(200).json({
      message: "Logout successful",
      timing,
    });
  } catch (error) {
    console.error("❌ Auth Logout Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
