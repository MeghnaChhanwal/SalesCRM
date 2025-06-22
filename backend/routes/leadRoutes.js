import express from "express";
import { getLeads, uploadCSV } from "../controllers/leadController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getLeads);
router.post("/upload", upload.single("file"), uploadCSV);

export default router;
