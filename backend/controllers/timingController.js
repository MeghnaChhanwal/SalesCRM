import { handleFinalCheckOut, getTodayTimings } from "../services/timingService.js";

export const finalCheckOut = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const timing = await handleFinalCheckOut(employeeId);
    res.status(200).json({ message: "Checked out", timing });
  } catch (error) {
    res.status(500).json({ error: "Check-out failed" });
  }
};

export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const timings = await getTodayTimings(employeeId);
    res.status(200).json(timings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch timings" });
  }
};
