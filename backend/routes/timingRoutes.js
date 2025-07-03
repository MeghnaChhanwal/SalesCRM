import express from "express";
import {
  getTodayTiming,
  getBreakHistory,
  autoCheckout,
} from "../controllers/timingController.js";

const router = express.Router();

// ✅ Get today's timing for an employee (e.g. /api/timing/EMP_ID)
router.get("/:id", getTodayTiming);

// ✅ Get last 7 days' break logs for an employee (e.g. /api/timing/breaks/EMP_ID)
router.get("/breaks/:id", getBreakHistory);

// ✅ Auto-checkout on tab close (e.g. /api/timing/auto-checkout/EMP_ID)
router.post("/auto-checkout/:id", autoCheckout);

export default router;
