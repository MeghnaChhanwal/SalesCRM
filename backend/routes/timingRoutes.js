import express from "express";
import { getTodayTiming, getBreakHistory } from "../controllers/timingController.js";

const router = express.Router();

// ✅ More specific routes go first
router.get("/breaks/:id", getBreakHistory);
router.get("/:id", getTodayTiming);

export default router;
