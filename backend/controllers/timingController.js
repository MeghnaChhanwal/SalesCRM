import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ 1. GET TODAY'S TIMING (check-in, check-out, break status)
export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;
  const date = todayIST();

  try {
    const today = await Timing.find({
      employee: employeeId,
      date,
    }).sort({ createdAt: -1 });

    res.status(200).json(today);
  } catch (error) {
    console.error("❌ Error fetching today’s timing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ 2. GET 7-DAY BREAK LOGS (for Home.jsx summary)
export const get7DayBreakLogs = async (req, res) => {
  const { employeeId } = req.params;

  const today = new Date();
  const past7Date = new Date();
  past7Date.setDate(today.getDate() - 6);

  try {
    const logs = await Timing.find({
      employee: employeeId,
      date: { $gte: past7Date.toISOString().split("T")[0] },
    })
      .select("date breaks")
      .sort({ date: -1 });

    res.status(200).json(logs);
  } catch (error) {
    console.error("❌ Error fetching 7-day break logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
