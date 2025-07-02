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

    // ✅ Mark employee as Active
    employee.status = "Active";
    await employee.save();

    const date = todayIST();
    const time = timeIST();

    // ✅ Check if today's timing exists and not checked out
    let timing = await Timing.findOne({
      employee: employee._id,
      date,
      checkOut: { $exists: false },
    });

    if (!timing) {
      // ✅ First login of the day or after checkout – create new entry
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      // ✅ Already has active session – update status only
      timing.status = "Active";

      // ✅ Close any ongoing break
      const lastBreak = timing.breaks?.[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
        timing.breakStatus = "OffBreak";
      }
    }

    await timing.save();

    // ✅ Return session data
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
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ LOGOUT CONTROLLER
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  // 🔐 Extra check to prevent CastError
  if (!employeeId || employeeId === "undefined") {
    return res.status(400).json({ error: "Invalid or missing employee ID" });
  }

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
        breakStatus: "OnBreak",
        $push: { breaks: { start: time } },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Logged out successfully",
      timing,
    });
  } catch (error) {
    console.error("❌ Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
