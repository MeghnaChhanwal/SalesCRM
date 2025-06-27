import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

export const resumeFromBreak = async (req, res) => {
  const { employeeId } = req.body;

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: todayIST() });
    if (!timing) return res.status(404).json({ message: "No timing record found" });

    const lastBreak = timing.breaks[timing.breaks.length - 1];
    if (lastBreak && !lastBreak.end) {
      lastBreak.end = timeIST();
    }

    timing.status = "Active";
    await timing.save();
    res.status(200).json({ message: "Resumed from break" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resume from break" });
  }
};

export const getTimings = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const timings = await Timing.find({ employee: employeeId }).sort({ date: -1 });
    res.status(200).json(timings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch timings" });
  }
};
