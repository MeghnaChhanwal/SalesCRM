// routes/timingRoutes.js

import express from "express";
import {
  getTodayTiming,
  getPast7DaysTiming,
  getSummaryTiming
} from "../controllers/timingController.js";

const router = express.Router();

// 📊 Get last 7 days timing history
router.get("/history/:employeeId", getPast7DaysTiming);

// 📈 Get summary (week or month)
router.get("/summary/:employeeId", getSummaryTiming); // query: ?range=week|month

// 📅 Get today's timing (⚠️ keep last)
router.get("/:employeeId", getTodayTiming);

export default router;
