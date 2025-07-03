// controllers/timingController.js

import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ Auto Checkout Controller — called when tab closes
export const autoCheckout = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) return res.status(400).json({ error: "Missing ID" });

    const date = todayIST();
    const now = new Date();

    const timing = await Timing.findOne({
      employee: employeeId,
      date,
      checkOut: { $exists: false },
    });

    if (timing) {
      const lastBreak = timing.breaks?.[timing.breaks.length - 1];

      if (!lastBreak || lastBreak.end) {
        // ➤ Start new break if none is open
        timing.breaks.push({ start: now });
        timing.breakStatus = "OnBreak";
      }

      // ➤ Perform checkout
      timing.checkOut = now;
      timing.status = "Inactive";

      await timing.save();
    }

    res.status(200).json({ message: "Auto checkout done" });
  } catch (error) {
    console.error("❌ AutoCheckout Error:", error);
    res.status(500).json({ error: "Auto-checkout failed" });
  }
};
