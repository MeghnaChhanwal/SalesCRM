import express from "express";
import multer from "multer";
import {
  getLeads,
  addLeadManually,
  uploadCSV,
  updateLeadType,
  updateLeadStatus,
  scheduleCall,
  getScheduledCalls
} from "../controllers/leadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 📌 Put more specific routes before general ones
router.get("/schedule", getScheduledCalls);         // GET all scheduled calls
router.get("/", getLeads);                          // GET all/searchable leads
router.post("/", addLeadManually);                  // POST new lead
router.post("/upload", upload.single("file"), uploadCSV); // CSV Upload
router.patch("/:id/type", updateLeadType);          // Update lead type
router.patch("/:id/status", updateLeadStatus);      // Update lead status
router.post("/:id/schedule", scheduleCall);         // Schedule call

export default router;
