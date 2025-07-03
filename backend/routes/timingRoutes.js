// routes/timingRoutes.js
import express from "express";
import {
  getTodayTiming,
  getPast7DaysTiming,
  getSummaryTiming,
  get7DayBreakLogs, // ✅ Import the controller
} from "../controllers/timingController.js";

const router = express.Router();

// 🟢 Get today's login/break/check-out details
router.get("/:employeeId", getTodayTiming);

// 🟢 Get past 7 days login data
router.get("/history/:employeeId", getPast7DaysTiming);

// 🟢 Get summary (week/month) of work and break duration
router.get("/summary/:employeeId", getSummaryTiming);

// ✅ Get 7-day break logs only (start, end, date)
router.get("/breaks/:employeeId", get7DayBreakLogs);

export default router;
