import express from "express";
import {
  getTodayTiming,
  getBreakHistory,
  getAllTimings,
} from "../controllers/timingController.js";

const router = express.Router();

router.get("/today/:id", getTodayTiming);
router.get("/breaks/:id", getBreakHistory);
router.get("/", getAllTimings); // admin only

export default router;
