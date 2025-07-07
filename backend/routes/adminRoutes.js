import express from "express";
import { updateAdminProfile } from "../controllers/adminController.js";

const router = express.Router();


router.get("/ping", (req, res) => {
  res.send(" admin route working");
});


router.put("/update", updateAdminProfile);

export default router;
