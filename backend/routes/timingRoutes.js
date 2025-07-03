import express from "express";
import {
  getTodayTiming,
  get7DayBreakLogs
} from "../controllers/timingController.js";

const router = express.Router();

router.get("/:employeeId", getTodayTiming);              // GET today's check-in, break status
router.get("/breaks/:employeeId", get7DayBreakLogs);     // GET last 7 days' break logs

export default router;
