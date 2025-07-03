import express from "express";
import {
  getDashboardOverview,
  getChartData
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/overview", getDashboardOverview);
router.get("/chart", getChartData);

export default router;
