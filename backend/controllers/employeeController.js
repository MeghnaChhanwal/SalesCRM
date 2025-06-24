import Employee from "../models/employee.js";
import Timing from "../models/timing.js";

// ✅ GET all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// ✅ CREATE new employee
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

// ✅ UPDATE employee
export const updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(updated);
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Failed to update employee" });
    }
  }
};

// ✅ DELETE employee
export const deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

// ✅ LOGIN employee (email + lastName as password) + CHECK-IN
export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (employee.lastName.toLowerCase() !== password.toLowerCase()) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // ✅ Check-In Timing Logic on Login
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString();

    let timing = await Timing.findOne({ employee: employee._id, date: today });

    if (!timing) {
      // Create new check-in
      timing = new Timing({
        employee: employee._id,
        date: today,
        checkIn: timeStr,
        status: "Active",
      });
    } else if (!timing.checkIn) {
      // Update existing with check-in if not already set
      timing.checkIn = timeStr;
      timing.status = "Active";
    }

    await timing.save();

    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err });
  }
};
