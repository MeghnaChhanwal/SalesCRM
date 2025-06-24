import express from "express";
import {
  checkIn,
  checkOut,
  finalCheckOut,
  getTodayTiming
} from "../controllers/timingController.js";

const router = express.Router();

// Employee logs in / ends break
router.post("/check-in/:employeeId", checkIn);

// Employee logs out tab-close → starts break
router.post("/check-out/:employeeId", checkOut);

// Optional: final end-of-day logout
router.post("/final-check-out/:employeeId", finalCheckOut);

// Fetch today’s record
router.get("/today/:employeeId", getTodayTiming);

export default router;
