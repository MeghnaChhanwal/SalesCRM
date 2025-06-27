import express from "express";
import { resumeFromBreak, getTimings } from "../controllers/timingController.js";

const router = express.Router();

router.post("/resume", resumeFromBreak);
router.get("/:employeeId", getTimings);

export default router;
