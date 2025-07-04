import express from "express";
import {
  getTodayTiming,
  getBreakHistory,
} from "../controllers/timingController.js";
import { logoutEmployee } from "../controllers/authController.js";

const router = express.Router();

// ✅ Get today's timing for an employee
router.get("/:id", getTodayTiming);

// ✅ Get today's breaks for an employee
router.get("/breaks/:id", getBreakHistory);

// ✅ Auto-checkout on tab close
router.post("/auto-checkout/:id", logoutEmployee);

export default router;
