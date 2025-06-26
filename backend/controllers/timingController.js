import Timing from "../models/timing.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ Check-In (Every login creates new entry)
export const checkIn = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const timing = new Timing({
      employee: employeeId,
      date: todayIST(),
      checkIn: timeIST(),
      status: "Active",
    });

    await timing.save();
    res.status(200).json({ message: "Checked in", timing });
  } catch (error) {
    res.status(500).json({ error: "Check-in failed" });
  }
};

// ✅ Final Check-Out (Tab close)
export const finalCheckOut = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const timing = await Timing.findOneAndUpdate(
      {
        employee: employeeId,
        date: todayIST(),
        checkOut: { $exists: false },
      },
      {
        checkOut: timeIST(),
        status: "Inactive",
      },
      { new: true, sort: { _id: -1 } }
    );

    await Employee.findByIdAndUpdate(employeeId, { status: "Inactive" });

    res.status(200).json({ message: "Checked out", timing });
  } catch (error) {
    res.status(500).json({ error: "Check-out failed" });
  }
};

// ✅ Get Today's Timing
export const getTodayTiming = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const records = await Timing.find({
      employee: employeeId,
      date: todayIST(),
    }).sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch today's timings" });
  }
};
