// controllers/authController.js
import Employee from "../models/employee.js";
import { handleCheckInOrBreakEnd } from "../services/timingService.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Login Controller
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

    if (employee.status === "Active")
      return res.status(403).json({ error: "Already logged in from another device or tab" });

    // ✅ Set employee status to active
    employee.status = "Active";
    await employee.save();

    // ✅ Handle first check-in or end of break
    const { message } = await handleCheckInOrBreakEnd(employee._id);

    res.status(200).json({
      message: `Login successful - ${message}`,
      employeeId: employee._id,
      name: employee.firstName,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ Logout Controller (called on tab close only)
export const logoutEmployee = async (req, res) => {
  const { employeeId } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    // ✅ Add break start and mark inactive
    await Timing.findOneAndUpdate(
      { employee: employeeId, date, checkOut: { $exists: false } },
      {
        $push: { breaks: { start: time } },
        breakStatus: "OnBreak",
        status: "Inactive",
      }
    );

    // ✅ Update employee status
    await Employee.findByIdAndUpdate(employeeId, { status: "Inactive" });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
