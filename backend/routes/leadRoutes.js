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

router.get("/leads", getLeads);
router.post("/leads", addLeadManually);
router.post("/leads/upload", upload.single("file"), uploadCSV);
router.patch("/leads/:id/type", updateLeadType);
router.patch("/leads/:id/status", updateLeadStatus);
router.post("/leads/:id/schedule", scheduleCall);
router.get("/schedule", getScheduledCalls);

export default router;
