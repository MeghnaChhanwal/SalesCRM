import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee || employee.lastName.toLowerCase() !== password.toLowerCase()) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    employee.status = "Active";
    await employee.save();

    const today = todayIST();
    let timing = await Timing.findOne({ employee: employee._id, date: today });

    if (!timing || timing.status === "Inactive") {
      // Create new timing entry for today
      timing = new Timing({
        employee: employee._id,
        date: today,
        checkIn: timeIST(),
        status: "Active",
        breaks: [],
      });
    } else {
      // Resume after break
      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = timeIST();
      }
      timing.status = "Active";
    }

    await timing.save();
    res.status(200).json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

export const logoutEmployee = async (req, res) => {
  const employeeId = req.params.id;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.status = "Inactive";
    await employee.save();

    const today = todayIST();
    const timing = await Timing.findOne({ employee: employeeId, date: today, status: "Active" });

    if (timing) {
      const checkoutTime = timeIST();
      timing.checkOut = checkoutTime;
      timing.status = "Inactive";
      timing.breaks.push({ start: checkoutTime, end: "" });
      await timing.save();
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logout failed" });
  }
};