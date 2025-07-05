// controllers/authController.js
import Timing from "../models/timing.js";
import Employee from "../models/employee.js";
import { todayIST, getCurrentISTTime } from "../utils/time.js";

export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emp = await Employee.findOne({ email });

    if (!emp || emp.lastName !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const today = todayIST();
    let timing = await Timing.findOne({ employee: emp._id, date: today });

    if (!timing) {
      timing = await Timing.create({
        employee: emp._id,
        date: today,
        checkIn: getCurrentISTTime(),
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else if (!timing.checkOut) {
      timing.status = "Active";
      await timing.save();
    }

    emp.status = "Active";
    await emp.save();

    res.status(200).json(emp);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

export const logoutEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const today = todayIST();

    const emp = await Employee.findById(id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    emp.status = "Inactive";
    await emp.save();

    const timing = await Timing.findOne({ employee: id, date: today });
    if (timing && !timing.checkOut) {
      timing.checkOut = getCurrentISTTime();
      timing.status = "Inactive";
      await timing.save();
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
};
