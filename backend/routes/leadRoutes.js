import express from "express";
import multer from "multer";
import {
  getLeads,
  addLeadManually,
  uploadCSV,
  updateLeadType,
  updateLeadStatus,
  scheduleCall,
  getScheduledCalls,
} from "../controllers/leadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * 📦 ROUTES FOR LEADS
 */

// 🗓️ Get all scheduled calls or today's calls
router.get("/schedule", getScheduledCalls);

// 📄 Get all leads with pagination, search, filter, and assignedEmployee param
router.get("/", getLeads);

// ➕ Add a lead manually (used in Admin panel)
router.post("/", addLeadManually);

// ⬆️ Upload multiple leads via CSV (Admin panel bulk import)
router.post("/upload", upload.single("file"), uploadCSV);

// 🔁 Update type of a lead (Hot, Warm, Cold)
router.patch("/:id/type", updateLeadType);

// 🔒 Update status of a lead (Ongoing ↔ Closed)
router.patch("/:id/status", updateLeadStatus);

// 📞 Schedule a follow-up call for a lead
router.post("/:id/schedule", scheduleCall);

export default router;
