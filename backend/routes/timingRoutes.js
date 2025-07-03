import express from "express";
import {
  getTodayTiming,
  get7DayBreakLogs,
} from "../controllers/timingController.js";

const router = express.Router();

router.get("/:employeeId", getTodayTiming);
router.get("/breaks/:employeeId", get7DayBreakLogs);

export default router;
