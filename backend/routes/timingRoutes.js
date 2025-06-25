// routes/timingRoutes.js
import express from "express";
import {
  checkIn,
  finalCheckOut,
  getTodayTiming
} from "../controllers/timingController.js";

const router = express.Router();

// ✅ Employee check-in (only on login)
router.post("/check-in/:employeeId", checkIn);

// ✅ Final checkout (only on tab/browser close)
router.post("/final-check-out/:employeeId", finalCheckOut);

// ✅ Get today’s timing status (used in dashboard)
router.get("/today/:employeeId", getTodayTiming);

export default router;
