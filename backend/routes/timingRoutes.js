// routes/timingRoutes.js

import express from "express";
import {
  getTodayTiming,
  getPast7DaysTiming,
  getSummaryTiming
} from "../controllers/timingController.js";

const router = express.Router();

// 📅 Get today's timing
router.get("/:employeeId", getTodayTiming);

// 📊 Get last 7 days timing history
router.get("/history/:employeeId", getPast7DaysTiming);

// 📈 Get summary (week or month)
router.get("/summary/:employeeId", getSummaryTiming); // query: ?range=week|month

export default router;
