import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ LOGIN: Check-in / Resume session / Auto-end break
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

    const date = todayIST();
    const time = timeIST();

    // Step 1: Update Employee Status
    employee.status = "Active";
    await employee.save();

    // Step 2: Find or create Timing
    let timing = await Timing.findOne({ employee: employee._id, date });

    if (!timing) {
      // ➕ First login today – new timing doc
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      // 🔁 Re-login same day – overwrite check-in
      timing.checkIn = time;
      timing.status = "Active";
      timing.breakStatus = "OffBreak";

      // ✅ Auto-end any open break
      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
      }
    }

    await timing.save();

    // ✅ Return updated employee
    const updatedEmployee = await Employee.findById(employee._id).lean();
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ LOGOUT: Check-out + Inactive + idle break
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    // Step 1: Mark employee inactive
    employee.status = "Inactive";
    await employee.save();
    console.log(`👋 Employee ${employeeId} marked as Inactive`);

    // Step 2: Update timing
    const date = todayIST();
    const time = timeIST();

    const timing = await Timing.findOne({ employee: employeeId, date });

    if (timing) {
      timing.checkOut = time;
      timing.status = "Inactive";
      timing.breakStatus = "OnBreak";

      // ➕ Log idle break to mark session end
      timing.breaks.push({ start: time });
      await timing.save();

      console.log(`📅 Timing updated for ${employeeId} on ${date}`);
      res.status(200).json({ message: "Logged out", timing });
    } else {
      console.warn(`⚠️ No timing found for logout: ${employeeId} on ${date}`);
      res.status(200).json({ message: "Logged out (no timing found)", employee });
    }
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
