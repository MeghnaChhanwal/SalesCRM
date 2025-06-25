import express from "express";
import {
  checkIn,
  finalCheckOut,
  getTodayTiming,
} from "../controllers/timingController.js";

const router = express.Router();

// Use POST for check-in and final-check-out to support sendBeacon
router.post("/check-in/:employeeId", checkIn);          // POST /api/timing/check-in/:id
router.post("/final-check-out/:employeeId", finalCheckOut); // POST /api/timing/final-check-out/:id
router.get("/today/:employeeId", getTodayTiming);       // GET /api/timing/today/:id

export default router;
