import express from "express";
import {
  checkIn,
  finalCheckOut,
  getTodayTiming
} from "../controllers/timingController.js";

const router = express.Router();

// ✅ Correct routes
router.post("/check-in/:employeeId", checkIn);
router.post("/final-check-out/:employeeId", finalCheckOut);
router.get("/today/:employeeId", getTodayTiming); // ✅ this is the fix

export default router;
