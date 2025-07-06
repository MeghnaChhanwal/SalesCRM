import express from "express";
import {
  getDashboardOverview,
  getChartData,
} from "../controllers/dashboardController.js";
import { getAdminRecentActivities } from "../controllers/activityController.js";

const router = express.Router();

router.get("/overview", getDashboardOverview);
router.get("/chart", getChartData);
router.get("/activity/admin", getAdminRecentActivities);

export default router;
