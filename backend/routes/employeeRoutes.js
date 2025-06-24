import express from "express";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

// 🔐 Login
router.post("/login", loginEmployee);

// 👥 CRUD for Employees
router.get("/", getEmployees);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
