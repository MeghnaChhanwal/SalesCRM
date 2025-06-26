import express from "express";
import { updateAdminProfile } from "../controllers/adminController.js";

const router = express.Router();

router.put("/admin/update", updateAdminProfile); // PUT for updates

export default router;
