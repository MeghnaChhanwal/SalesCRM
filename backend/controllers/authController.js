import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

//  Check-in 
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

    // Update Employee Status
    employee.status = "Active";
    await employee.save();

    //  Find or Create Timing Entry
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
      //  Re-login same day
      timing.checkIn = time;
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

// LOGOUT
export const logoutEmployee = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    //  Mark employee as Inactive
    employee.status = "Inactive";
    await employee.save();
    console.log(`Employee ${employeeId} marked as Inactive`);

    const date = todayIST();
    const time = timeIST();

    const timing = await Timing.findOne({ employee: employeeId, date });

    if (timing) {
      timing.checkOut = time;
      timing.status = "Inactive";
      timing.breakStatus = "OnBreak";

      //  duplicate break push
      const lastBreak = timing.breaks[timing.breaks.length - 1];
      if (!lastBreak || (lastBreak && lastBreak.start !== time)) {
        timing.breaks.push({ start: time });
      }

      await timing.save();

      console.log(`Timing updated for ${employeeId} on ${date}`);
      res.status(200).json({ message: "Logged out", employeeId, date });
    } else {
      console.warn(`No timing found for logout: ${employeeId} on ${date}`);
      res.status(200).json({ message: "Logged out (no timing found)", employeeId });
    }
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
