import { handleFinalCheckOut, getTodayTimings } from "../services/timingService.js";

export const finalCheckOut = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const timing = await handleFinalCheckOut(employeeId);
    res.status(200).json({ message: "Checked out", timing });
  } catch (error) {
    res.status(500).json({ error: "Check-out failed" });
  }
};

export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const timings = await getTodayTimings(employeeId);
    res.status(200).json(timings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch timings" });
  }
};

// ✅ controllers/employeeController.js
import Employee from "../models/employee.js";

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const newEmp = new Employee(req.body);
    await newEmp.save();
    res.status(201).json(newEmp);
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: err.message });
    } else if (err.code === 11000) {
      res.status(400).json({ error: "Email or Employee ID already exists" });
    } else {
      res.status(500).json({ error: "Failed to create employee" });
    }
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Employee not found" });
    res.status(200).json(updated);
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Failed to update employee" });
    }
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Employee not found" });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
};