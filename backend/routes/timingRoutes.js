import express from "express";
import {
  getTodayTiming,
  getBreakHistory,
  getBreakHistoryBasic,
} from "../controllers/timingController.js";

const router = express.Router();

router.get("/breaks/:id", getBreakHistory);
router.get("/history/basic/:id", getBreakHistoryBasic); // <- new route
router.get("/:id", getTodayTiming);

export default router;
