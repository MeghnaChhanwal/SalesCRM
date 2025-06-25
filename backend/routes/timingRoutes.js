import express from "express";
import {
  checkIn,
  finalCheckOut,
  getTodayTiming
} from "../controllers/timingController.js";

const router = express.Router();

// ✅ Employee check-in (called after login)
router.post("/check-in/:employeeId", checkIn);

// ✅ Final check-out (called on tab/browser close)
router.post("/final-check-out/:employeeId", finalCheckOut);

// ✅ Get today’s timing details for the logged-in employee
router.get("/:employeeId", getTodayTiming);

export default router;
