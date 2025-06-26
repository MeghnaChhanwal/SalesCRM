// controllers/timingController.js
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Final checkout (called by sendBeacon on tab close)
export const finalCheckOut = async (req, res) => {
  const { employeeId } = req.params;
  const date = todayIST();
  const time = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date });
    if (timing && !timing.checkOut) {
      timing.checkOut = time;
      await timing.save();
    }

    res.status(200).json({ message: "Checked out on tab close" });
  } catch (error) {
    res.status(500).json({ error: "Final checkout failed" });
  }
};

// ✅ Get today’s timing
export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;
  const date = todayIST();

  try {
    const timing = await Timing.find({ employee: employeeId, date });
    res.status(200).json(timing);
  } catch (error) {
    console.error("Get Today Timing Error:", error);
    res.status(500).json({ error: "Failed to fetch today's timing" });
  }
};
