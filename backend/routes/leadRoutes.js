// routes/leadRoutes.js
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

// 🔁 Routes
router.get("/schedule", getScheduledCalls);               // ✅ Get scheduled calls (all/today)
router.get("/", getLeads);                                // ✅ Get leads with filters
router.post("/", addLeadManually);                        // ✅ Add new lead manually
router.post("/upload", upload.single("file"), uploadCSV); // ✅ Upload leads via CSV
router.patch("/:id/type", updateLeadType);                // ✅ Update lead type
router.patch("/:id/status", updateLeadStatus);            // ✅ Update lead status
router.post("/:id/schedule", scheduleCall);               // ✅ Schedule a call

export default router;
