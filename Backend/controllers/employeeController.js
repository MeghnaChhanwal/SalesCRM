
import Employee from "../models/employee.js";

export const getEmployees = async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
};

export const createEmployee = async (req, res) => {
  const newEmp = new Employee(req.body);
  await newEmp.save();
  res.status(201).json(newEmp);
};

export const updateEmployee = async (req, res) => {
  const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteEmployee = async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
};
