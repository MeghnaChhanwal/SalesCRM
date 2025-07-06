import activityController from "../controllers/activityController.js";

const router = express.Router();

router.get("/admin", activityController.getAdminRecentActivities);
router.get("/employee/:id", activityController.getEmployeeActivity);
