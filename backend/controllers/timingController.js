import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ Get today's timing
export const getTodayTiming = async (req, res) => {
  try {
    const date = todayIST();
    const timings = await Timing.find({ employee: req.params.id, date });
    res.json(timings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch timing" });
  }
};

// ✅ Get today's breaks
export const getBreakHistory = async (req, res) => {
  try {
    const date = todayIST();
    const timing = await Timing.findOne({ employee: req.params.id, date });
    res.json(timing?.breaks || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch break history" });
  }
};
