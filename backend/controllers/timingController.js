// backend/controllers/timingController.js

import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

export const finalCheckOut = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = todayIST();
    const now = timeIST();

    const timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      return res.status(404).json({ error: "No check-in found" });
    }

    if (timing.checkOut) {
      return res.status(400).json({ error: "Already checked out" });
    }

    timing.checkOut = now;
    timing.status = "Inactive";

    await timing.save();
    res.status(200).json({ message: "Checked out successfully", timing });
  } catch (err) {
    console.error("Final Checkout Error:", err);
    res.status(500).json({ error: "Checkout failed", details: err.message });
  }
};

export const getTodayTiming = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = todayIST();

    const timing = await Timing.findOne({ employee: employeeId, date: today });
    if (!timing) return res.status(404).json({ error: "No timing found for today" });

    res.status(200).json(timing);
  } catch (err) {
    console.error("Get Timing Error:", err);
    res.status(500).json({ error: "Failed to fetch today's timing" });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = todayIST();
    const now = timeIST();

    let timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      timing = new Timing({
        employee: employeeId,
        date: today,
        checkIn: now,
        status: "Active",
        breaks: [],
      });
    } else {
      if (timing.checkOut) {
        timing.breaks.push({ start: timing.checkOut, end: now, date: today });
      }

      const openBreak = timing.breaks.find((b) => !b.end);
      if (openBreak) openBreak.end = now;

      timing.checkIn = now;
      timing.checkOut = null;
      timing.status = "Active";
    }

    await timing.save();
    res.status(200).json({ message: "Check-in successful", timing });
  } catch (err) {
    console.error("Check-in Error:", err);
    res.status(500).json({ error: "Check-in failed", details: err.message });
  }
};
