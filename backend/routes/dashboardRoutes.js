import express from "express";
import {
  getDashboardOverview,
  getChartData
} from "../controllers/dashboardController.js";

const router = express.Router();

// 👉 Dashboard overview (admin + stats + recent activity)
router.get("/overview", getDashboardOverview);

// 👉 Conversion + lead chart data (optional frontend graph)
router.get("/chart", getChartData);

export default router;
