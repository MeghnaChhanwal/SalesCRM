import express from "express";
import {
  getTodayTiming,
  getBreakHistory,
} from "../controllers/timingController.js";

const router = express.Router();

router.get("/:id", getTodayTiming);             // GET /api/timing/:id
router.get("/breaks/:id", getBreakHistory);     // GET /api/timing/breaks/:id

export default router;
