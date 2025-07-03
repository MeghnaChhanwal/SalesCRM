import express from "express";
import { getTodayTiming, getBreakHistory } from "../controllers/timingController.js";

const router = express.Router();

router.get("/:id", getTodayTiming); // /api/timing/:id
router.get("/breaks/:id", getBreakHistory); // /api/timing/breaks/:id

export default router;
