import {
  getAdminRecentActivities,
  getEmployeeActivity
} from "../controllers/activityController.js";

const router = express.Router();

router.get("/admin", getAdminRecentActivities);
router.get("/employee/:id", getEmployeeActivity);

export default router;
