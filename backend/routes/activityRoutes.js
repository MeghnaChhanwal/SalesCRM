import express from "express";
import {
  getAdminRecentActivities,
  getEmployeeActivity,
} from "../controllers/activityController.js";

const router = express.Router();

// 🟢 Admin activity route
router.get("/admin", getAdminRecentActivities);

// 🟢 Employee personal activity
router.get("/employee/:id", getEmployeeActivity);

export default router;
