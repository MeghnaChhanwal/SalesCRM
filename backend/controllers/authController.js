import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";


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

  
    employee.status = "Active";
    await employee.save();


    let timing = await Timing.findOne({ employee: employee._id, date });

    if (!timing) {
      timing = new Timing({
        employee: employee._id,
        date,
        checkIn: time,
        checkOut: null,
        status: "Active",
        breakStatus: "OffBreak",
        breaks: [],
      });
    } else {
      timing.checkIn = time;
      timing.checkOut = null;
      timing.status = "Active";
      timing.breakStatus = "OffBreak";

      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = time;
      }
    }

    await timing.save();

    const { _id, firstName, lastName, status } = employee;
    res.status(200).json({ _id, firstName, lastName, email, status });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(200).end(); 

    employee.status = "Inactive";
    await employee.save();

    const date = todayIST();
    const time = timeIST();

    const timing = await Timing.findOne({ employee: employeeId, date });

    if (timing && !timing.checkOut) {
      timing.checkOut = time;
      timing.status = "Inactive";
      timing.breakStatus = "CheckedOut"; 

      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (!lastBreak || (lastBreak && !lastBreak.end)) {
        timing.breaks.push({ start: time });
      }

      await timing.save();
      console.log(" Logout timing updated:", timing);
    }

    return res.status(200).end(); 
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).end(); 
  }
};
