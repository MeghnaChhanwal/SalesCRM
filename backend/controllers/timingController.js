// controllers/timingController.js

import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ Get Today's Timing
export const getTodayTiming = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();

  try {
    const timing = await Timing.find({ employee: employeeId, date });
    res.json(timing);
  } catch (err) {
    console.error("❌ Error fetching today's timing:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get Break History
export const getBreakHistory = async (req, res) => {
  const { id: employeeId } = req.params;

  try {
    const history = await Timing.find({
      employee: employeeId,
      breaks: { $exists: true, $not: { $size: 0 } }
    }).sort({ date: -1 });

    res.json(history);
  } catch (err) {
    console.error("❌ Error fetching break history:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Start Break
export const startBreak = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();
  const now = new Date();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing)
      return res.status(404).json({ error: "No timing record found" });

    timing.breaks.push({ start: now });
    timing.breakStatus = "OnBreak";
    timing.status = "Inactive";

    await timing.save();
    res.json({ message: "Break started", timing });
  } catch (err) {
    console.error("❌ Start Break Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ End Break
export const endBreak = async (req, res) => {
  const { id: employeeId } = req.params;
  const date = todayIST();
  const now = new Date();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (!timing || !timing.breaks.length)
      return res.status(404).json({ error: "No ongoing break found" });

    const lastBreak = timing.breaks[timing.breaks.length - 1];
    if (!lastBreak.end) lastBreak.end = now;

    timing.breakStatus = "OffBreak";
    timing.status = "Active";

    await timing.save();
    res.json({ message: "Break ended", timing });
  } catch (err) {
    console.error("❌ End Break Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
