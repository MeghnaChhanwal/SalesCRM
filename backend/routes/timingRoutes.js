import express from "express";
import {
  getTodayTiming,
  getBreakHistory,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  
} from "../controllers/timingController.js";

const router = express.Router();

router.get("/:id/today", getTodayTiming);
router.get("/:id/breaks", getBreakHistory);
router.post("/:id/checkin", checkIn);
router.post("/:id/checkout", checkOut);
router.post("/:id/break/start", startBreak);
router.post("/:id/break/end", endBreak);


export default router;
