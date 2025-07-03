import express from "express";
import {
  getDashboardOverview,
  getRecentActivity,
  getChartData
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/overview", getDashboardOverview);
router.get("/activity", getRecentActivity);
router.get("/chart", getChartData);

export default router;
