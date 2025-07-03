
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

// ✅ GET Today’s Timing (for Home Page)
export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;
  const date = todayIST();

  try {
    const today = await Timing.find({
      employee: employeeId,
      date,
    }).sort({ createdAt: -1 });

    res.status(200).json(today);
  } catch (err) {
    console.error("❌ Error fetching today timing:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ GET 7-Day Break Logs
export const get7DayBreakLogs = async (req, res) => {
  const { employeeId } = req.params;
  const today = new Date();
  const past7 = new Date();
  past7.setDate(today.getDate() - 6);

  try {
    const logs = await Timing.find({
      employee: employeeId,
      date: { $gte: past7.toISOString().split("T")[0] },
    })
      .select("date breaks")
      .sort({ date: -1 });

    res.status(200).json(logs);
  } catch (err) {
    console.error("❌ Error fetching 7-day logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};