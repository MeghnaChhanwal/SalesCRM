import express from "express";
import {
  checkIn,
  finalCheckOut,
  getTodayTiming,
} from "../controllers/timingController.js";

const router = express.Router();

// ✅ Check-In API (used on login)
router.post("/check-in/:employeeId", checkIn);              // POST /api/timing/check-in/:employeeId

// ✅ Final Check-Out API (tab/browser close)
router.post("/final-check-out/:employeeId", finalCheckOut); // POST /api/timing/final-check-out/:employeeId

// 🔄 Optional GET endpoint for testing via browser
router.get("/final-check-out/:employeeId", finalCheckOut);  // GET  /api/timing/final-check-out/:employeeId

// ✅ Get Today's Timing
router.get("/today/:employeeId", getTodayTiming);           // GET  /api/timing/today/:employeeId

export default router;
