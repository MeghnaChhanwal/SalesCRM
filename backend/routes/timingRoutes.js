import express from "express";
import {
  getTodayTiming,
  getPast7DaysTiming,
  getSummaryTiming
} from "../controllers/timingController.js";

const router = express.Router();

router.get("/:employeeId", getTodayTiming); // today
router.get("/history/:employeeId", getPast7DaysTiming); // last 7 days
router.get("/summary/:employeeId", getSummaryTiming); // ?range=week | month

export default router;
