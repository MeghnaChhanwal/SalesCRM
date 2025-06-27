import express from "express";
import {
  getEmployees,
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/", getEmployees);         // with pagination/search/sort
router.get("/all", getAllEmployees);   // all employees - dashboard use
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
