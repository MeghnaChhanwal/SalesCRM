// controllers/authController.js
import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ Login Controller
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

    // 🟢 Mark employee active
    employee.status = "Active";
    await employee.save();

    const date = todayIST();
    const time = new Date();

    // 🟢 Check last timing entry for today
    let timing = await Timing.findOne({ employee: employee._id, date }).sort({ createdAt: -1 });

    if (!timing || timing.checkOut) {
      // ✅ No existing or last was checked out — new login
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      // ✅ Existing active session — resume and end break if open
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

// ✅ Logout Controller
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  if (!employeeId || employeeId === "undefined")
    return res.status(400).json({ error: "Invalid or missing employee ID" });

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

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
      // 🟢 End open break if any
      const lastBreak = timing.breaks?.[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
      }

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
