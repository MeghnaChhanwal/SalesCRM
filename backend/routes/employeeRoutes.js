// routes/employeeRoutes.js
import express from "express";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

router.post("/login", loginEmployee); // 👈 Login route

router.get("/", getEmployees);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
