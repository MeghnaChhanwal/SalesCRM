import Employee from "../models/employee.js";
import { handleCheckInOrBreakEnd } from "../services/timingService.js";

export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (employee.lastName.toLowerCase() !== password.toLowerCase())
      return res.status(401).json({ error: "Invalid credentials" });

    if (employee.status === "Active")
      return res.status(403).json({ error: "Already logged in from another device or tab" });

    employee.status = "Active";
    await employee.save();

    const { message } = await handleCheckInOrBreakEnd(employee._id);

    res.status(200).json({ message: `Login successful - ${message}`, employeeId: employee._id, name: employee.firstName });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const logoutEmployee = async (req, res) => {
  const { employeeId } = req.params;
  try {
    await Employee.findByIdAndUpdate(employeeId, { status: "Inactive" });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};