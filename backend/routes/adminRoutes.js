import express from "express";
import { updateAdminProfile,getAdminProfile } from "../controllers/adminController.js";

const router = express.Router();


router.get("/ping", (req, res) => {
  res.send(" admin route working");
});

router.get("/me", getAdminProfile);
router.put("/update", updateAdminProfile);

export default router;
