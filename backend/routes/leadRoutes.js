import express from "express";
import {
  getLeads,
  addLeadManually,
  uploadCSV,
  updateLeadType,
  updateLeadStatus,
  scheduleCall,
  getScheduledCalls,
} from "../controllers/leadsController.js";

const router = express.Router();

router.get("/", getLeads);
router.post("/", addLeadManually);
router.post("/upload", uploadCSV);
router.patch("/:id/type", updateLeadType);
router.patch("/:id/status", updateLeadStatus);
router.post("/:id/schedule", scheduleCall);
router.get("/scheduled", getScheduledCalls);

export default router;
