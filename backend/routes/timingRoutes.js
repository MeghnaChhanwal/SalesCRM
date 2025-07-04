import express from "express";
import { getTodayTiming, getBreakHistory } from "../controllers/timingController.js";

const router = express.Router();

// 🔁 Get complete break history for an employee
router.get("/breaks/:id", getBreakHistory);

// 📅 Get today’s timing details (check-in, check-out, breaks)
router.get("/:id", getTodayTiming);

export default router;
