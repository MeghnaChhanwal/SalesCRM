import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ LOGIN CONTROLLER
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

    employee.status = "Active";
    await employee.save();

    const date = todayIST();
    const now = new Date();

    let timing = await Timing.findOne({ employee: employee._id, date }).sort({ createdAt: -1 });

    if (timing && !timing.checkOut) {
      // Resuming session: end last break if it's still open
      timing.status = "Active";
      if (timing.breaks?.length > 0) {
        const lastBreak = timing.breaks[timing.breaks.length - 1];
        if (!lastBreak.end) {
          lastBreak.end = now;
          timing.breakStatus = "OffBreak";
        }
      }
    } else {
      // Fresh login
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: now,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
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
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  if (!employeeId || employeeId === "undefined")
    return res.status(400).json({ error: "Invalid or missing employee ID" });

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    const date = todayIST();
    const now = new Date();

    const timing = await Timing.findOne({
      employee: employeeId,
      date,
      checkOut: { $exists: false },
    });

    if (timing) {
      const lastBreak = timing.breaks?.[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) lastBreak.end = now;

      timing.checkOut = now;
      timing.status = "Inactive";
      timing.breakStatus = "OffBreak";
      await timing.save();
    }

    employee.status = "Inactive";
    await employee.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("❌ Logout Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ AUTO CHECKOUT CONTROLLER (on tab close only)
export const autoCheckout = async (req, res) => {
  const { id: employeeId } = req.params;

  if (!employeeId || employeeId === "undefined")
    return res.status(400).json({ error: "Invalid or missing employee ID" });

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    const date = todayIST();
    const now = new Date();

    const timing = await Timing.findOne({
      employee: employeeId,
      date,
      checkOut: { $exists: false },
    });

    if (timing) {
      const lastBreak = timing.breaks?.[timing.breaks.length - 1];

      if (lastBreak && !lastBreak.end) {
        lastBreak.end = now;
      }

      if (!lastBreak || lastBreak.end) {
        timing.breaks.push({ start: now, end: now });
      }

      timing.checkOut = now;
      timing.status = "Inactive";
      timing.breakStatus = "OffBreak";

      await timing.save();
    }

    employee.status = "Inactive";
    await employee.save();

    res.status(200).json({ message: "Auto checkout successful" });
  } catch (error) {
    console.error("❌ Auto Checkout Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
