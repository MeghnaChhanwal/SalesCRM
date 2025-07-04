import express from "express";
import { getTodayTiming, getBreakHistory } from "../controllers/timingController.js";

const router = express.Router();

router.get("/:id", getTodayTiming);
router.get("/breaks/:id", getBreakHistory);

export default router;
