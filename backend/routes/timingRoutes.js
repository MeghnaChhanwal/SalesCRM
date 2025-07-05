import express from "express";
import {
  getTodayTiming,
  getBreakHistory,
  startBreak,
  endBreak,
  getAllTimings,
} from "../controllers/timingController.js";

const router = express.Router();

router.get("/today/:id", getTodayTiming);
router.get("/breaks/:id", getBreakHistory);
router.post("/start-break/:id", startBreak);
router.post("/end-break/:id", endBreak);

// Admin purpose
router.get("/", getAllTimings);

export default router;
