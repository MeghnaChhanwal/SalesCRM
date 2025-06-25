import express from "express";
import {
  checkIn,
  finalCheckOut,
  getTodayTiming,
} from "../controllers/timingController.js";

const router = express.Router();

router.put("/checkin/:employeeId", checkIn);        // /api/timing/checkin/:id
router.put("/checkout/:employeeId", finalCheckOut); // /api/timing/checkout/:id
router.get("/today/:employeeId", getTodayTiming);   // /api/timing/today/:id

export default router;
