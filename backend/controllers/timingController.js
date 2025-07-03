import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ 1. Get today's timing
export const getTodayTiming = async (req, res) => {
  try {
    const { id } = req.params;
    const date = todayIST();

    const timing = await Timing.find({ employee: id, date }).sort({ createdAt: -1 });
    res.json(timing);
  } catch (error) {
    console.error("❌ getTodayTiming Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ 2. Get break history for last 7 days
export const getBreakHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);

    const history = await Timing.find({
      employee: id,
      date: { $gte: fromDate.toISOString().split("T")[0] },
      "breaks.0": { $exists: true },
    });

    res.json(history);
  } catch (error) {
    console.error("❌ getBreakHistory Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ 3. Auto-checkout on tab close (not refresh)
export const autoCheckout = async (req, res) => {
  try {
    const { id } = req.params;
    const date = todayIST();
    const now = new Date();

    const timing = await Timing.findOne({
      employee: id,
      date,
      checkOut: { $exists: false },
    });

    if (timing) {
      const lastBreak = timing.breaks?.[timing.breaks.length - 1];

      // ✅ Only push break start if NO break started or previous ended
      if (!lastBreak || lastBreak.end) {
        timing.breaks.push({ start: now });
        timing.breakStatus = "OnBreak";
      }

      timing.checkOut = now;
      timing.status = "Inactive";

      await timing.save();
    }

    res.status(200).json({ message: "Auto-checkout successful" });
  } catch (error) {
    console.error("❌ autoCheckout Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
