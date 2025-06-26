// routes/timingRoutes.js
import express from "express";
import { getEmployeeTiming, checkOut } from "../controllers/timingController.js";

const router = express.Router();

// ✅ Get today's + last 7 days timing
router.get("/:employeeId", getEmployeeTiming);

// ✅ Checkout route (same as logout, but directly via beacon/tab close)
router.post("/checkout/:employeeId", checkOut);

export default router;
