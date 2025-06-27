// routes/leadRoutes.js
import express from "express";
import { getLeads, uploadCSV } from "../controllers/leadController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getLeads); // Fetch leads with search/sort/pagination
router.post("/upload", upload.single("file"), uploadCSV); // Upload CSV and assign leads

export default router;
