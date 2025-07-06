import express from "express";
import { getEmployeeActivity } from "../controllers/activityController.js";

const router = express.Router();

router.get("/employee/:id", getEmployeeActivity);

export default router;
