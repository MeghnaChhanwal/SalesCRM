// services/timingService.js
import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

export const handleCheckInOrBreakEnd = async (employeeId) => {
  const date = todayIST();
  const time = timeIST();

  const existing = await Timing.findOne({ employee: employeeId, date });

  if (!existing) {
    // ✅ First login of the day
    await Timing.create({
      employee: employeeId,
      date,
      checkIn: time,
      status: "Active",
      breakStatus: "OffBreak",
    });
    return { message: "Checked in" };
  }

  // ✅ Re-login after logout (OnBreak → end break)
  if (existing.breakStatus === "OnBreak") {
    const breaks = existing.breaks || [];
    const lastBreak = breaks[breaks.length - 1];

    if (lastBreak && !lastBreak.end) {
      lastBreak.end = time;
    }

    existing.breakStatus = "OffBreak";
    existing.status = "Active";
    existing.checkIn = time;
    await existing.save();

    return { message: "Returned from break" };
  }

  // ✅ Already logged in today
  return { message: "Already checked in today" };
};
