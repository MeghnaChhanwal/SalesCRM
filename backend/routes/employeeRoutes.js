import express from "express";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  autoUpdateEmployeeStatuses,
} from "../controllers/employeeController.js";

const router = express.Router();
router.get("/", getEmployees);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);
router.patch("/auto/update-status", autoUpdateEmployeeStatuses);

export default router;
