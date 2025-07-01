// controllers/authController.js

import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ LOGIN
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
      return res.status(403).json({ error: "Already logged in from another tab/device" });

    // Mark employee active
    employee.status = "Active";
    await employee.save();

    const date = todayIST();
    const time = timeIST();

    // Log timing
    let timing = await Timing.findOne({ employee: employee._id, date });

    if (!timing) {
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      timing.checkIn = timing.checkIn || time; // keep original if already checked in
      timing.status = "Active";

      // End any open break
      const lastBreak = timing.breaks?.[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
        timing.breakStatus = "OffBreak";
      }
    }

    await timing.save();

    res.status(200).json({
      message: "Login successful",
      employeeId: employee._id,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      status: employee.status,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ LOGOUT
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

    const timing = await Timing.findOneAndUpdate(
      { employee: employeeId, date, checkOut: { $exists: false } },
      {
        checkOut: time,
        status: "Inactive",
        breakStatus: "OnBreak", // Optional: treat logout as break start
        $push: { breaks: { start: time } },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Logged out successfully",
      timing,
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
