import Timing from "../models/time.js";
import moment from "moment";

// Helper to get today
const todayDate = () => moment().format("DD/MM/YY");

// ✅ Get All Employee Status for Today
export const getAllEmployeeStatus = async (req, res) => {
  try {
    const today = todayDate();

    const allTimings = await Timing.find({ date: today })
      .populate("employeeId", "firstName lastName email employeeId");

    res.json(allTimings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee status" });
  }
};
