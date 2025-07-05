import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Login (Check-In)
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

    // ✅ Set status Active
    employee.status = "Active";
    await employee.save();

    const date = todayIST();
    const time = timeIST();

    let timing = await Timing.findOne({ employee: employee._id, date });

    if (!timing) {
      // ✅ First login today
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      // ✅ Already logged today – update checkIn & status
      timing.checkIn = time;
      timing.status = "Active";
      timing.breakStatus = "OffBreak";

      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time; // end previous open break
      }
    }

    await timing.save();

    // Remove password and send employee data
    const { password: _, ...empData } = employee.toObject();
    res.status(200).json(empData);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ Logout (on tab close or unload)
export const logout = async (req, res) => {
  const { id } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    const employee = await Employee.findById(id);
    if (employee) {
      employee.status = "Inactive";
      await employee.save();
    }

    const timing = await Timing.findOne({ employee: id, date });
    if (timing) {
      timing.checkOut = time;
      timing.status = "Inactive";
      await timing.save();
    }

    res.status(200).json({ message: "Checked out & set inactive" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
};
