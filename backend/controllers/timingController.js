import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";
import moment from "moment-timezone";

// TODAY’S TIMING
export const getTodayTiming = async (req, res) => {
  const { id } = req.params;
  const date = todayIST();

  try {
    const logs = await Timing.find({ employee: id, date }).sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch timing" });
  }
};

// LAST 7 DAYS BREAK HISTORY
export const getBreakHistory = async (req, res) => {
  const { id } = req.params;
  const fromDate = moment().tz("Asia/Kolkata").subtract(6, "days").format("YYYY-MM-DD");

  try {
    const logs = await Timing.find({
      employee: id,
      date: { $gte: fromDate },
    }).sort({ date: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch break history" });
  }
};
