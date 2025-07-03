// controllers/timingController.js
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ Get today's timing for employee
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

// ✅ Get 7-day break history
export const getBreakHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);

    const history = await Timing.find({
      employee: id,
      date: { $gte: fromDate.toISOString().split("T")[0] },
      "breaks.0": { $exists: true }, // Only timings with at least 1 break
    });

    res.json(history);
  } catch (error) {
    console.error("❌ getBreakHistory Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Auto-checkout on tab close
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
      if (lastBreak && !lastBreak.end) lastBreak.end = now;

      timing.checkOut = now;
      timing.status = "Inactive";
      timing.breakStatus = "OffBreak";

      await timing.save();
    }

    res.status(200).json({ message: "Auto-checkout successful" });
  } catch (error) {
    console.error("❌ autoCheckout Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
