import {
  handleCheckInOrBreakEnd,
  handleFinalCheckOut,
  getTodayTimings
} from "../services/timingService.js";

// Final check-out on tab close or logout
export const finalCheckOut = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const timing = await handleFinalCheckOut(employeeId);
    res.status(200).json({ message: "Checked out and break started", timing });
  } catch (error) {
    console.error("Final Check-out Error:", error);
    res.status(500).json({ error: "Check-out failed" });
  }
};

// Fetch today's full timing logs
export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const timings = await getTodayTimings(employeeId);
    res.status(200).json(timings);
  } catch (error) {
    console.error("Fetch Timing Error:", error);
    res.status(500).json({ error: "Failed to fetch timings" });
  }
};
