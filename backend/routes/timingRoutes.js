// backend/routes/timingRoutes.js
import express from "express";
import {
  getTodayTiming,
  getPast7DaysTiming,
  getSummaryTiming,
} from "../controllers/timingController.js";

const router = express.Router();

router.get("/history/:employeeId", getPast7DaysTiming);
router.get("/summary/:employeeId", getSummaryTiming); // ?range=week|month
router.get("/:employeeId", getTodayTiming);

export default router;
