// routes/timingRoutes.js

import express from "express";
import {
  getTodayTiming,
  getBreakHistory,
  autoCheckout,
} from "../controllers/timingController.js";

const router = express.Router();

// ✅ Get today's timing for an employee
router.get("/:id", getTodayTiming);

// ✅ Get last 7 days break history
router.get("/breaks/:id", getBreakHistory);

// ✅ Auto-checkout on tab close
router.post("/auto-checkout/:id", autoCheckout);

export default router;
