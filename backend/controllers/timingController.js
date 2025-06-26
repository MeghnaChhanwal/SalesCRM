// controllers/timingController.js
import Timing from "../models/timing.js";
import Employee from "../models/employee.js";
import { todayIST, timeIST } from "../utils/time.js";

// ✅ GET EMPLOYEE TIMINGS (for break history)
export const getEmployeeTiming = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const timings = await Timing.find({ employee: employeeId })
      .sort({ date: -1 }) // latest first
      .limit(7); // last 7 days
    res.status(200).json(timings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching timings", err });
  }
};

// ✅ CHECKOUT API (alternative logout, called from frontend on unload/beacon)
export const checkOut = async (req, res) => {
  const { employeeId } = req.params;
  const today = todayIST();
  const now = timeIST();

  try {
    const timing = await Timing.findOne({ employee: employeeId, date: today });

    if (!timing) {
      return res.status(404).json({ message: "No check-in found today!" });
    }

    if (timing.checkout) {
      return res.status(400).json({ message: "Already checked out" });
    }

    // ✅ Perform checkout + start break
    timing.checkout = now;
    timing.status = "Inactive";
    timing.break.push({ start: now }); // break started, no end yet
    await timing.save();

    await Employee.findByIdAndUpdate(employeeId, { status: "Inactive" });

    res.status(200).json({ message: "Checked out successfully", timing });
  } catch (err) {
    res.status(500).json({ message: "Error during checkout", err });
  }
};
