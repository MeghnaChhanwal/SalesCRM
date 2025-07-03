// routes/timingRoutes.js
import express from "express";
import {
  getTodayTiming,
  getBreakHistory,
  autoCheckout,
} from "../controllers/timingController.js";

const router = express.Router();

router.get("/:id", getTodayTiming); // ➤ /api/timing/:employeeId
router.get("/breaks/:id", getBreakHistory); // ➤ /api/timing/breaks/:employeeId
router.get("/auto-checkout/:id", autoCheckout); // ➤ /api/timing/auto-checkout/:employeeId

export default router;
