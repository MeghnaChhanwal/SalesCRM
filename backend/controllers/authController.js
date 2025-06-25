import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (employee.lastName.toLowerCase() !== password.toLowerCase()) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const today = todayIST();
    const now = timeIST();

    let timing = await Timing.findOne({ employee: employee._id, date: today });

    // ❌ If already active, block login
    if (timing && timing.status === "Active") {
      return res.status(400).json({ error: "User already active on another device." });
    }

    // ✅ Perform check-in
    if (!timing) {
      timing = new Timing({
        employee: employee._id,
        date: today,
        checkIn: now,
        status: "Active",
        breaks: [],
      });
    } else {
      // Resume login after checkout
      timing.checkIn = now;
      timing.checkOut = null;
      timing.status = "Active";

      // Handle ongoing break (if break started but not ended)
      const openBreak = timing.breaks.find(b => !b.end);
      if (openBreak) {
        openBreak.end = now;
      } else if (timing.checkOut) {
        timing.breaks.push({
          start: timing.checkOut,
          end: now,
          date: today,
        });
      }
    }

    await timing.save();

    res.status(200).json({ user: employee, timing });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};
