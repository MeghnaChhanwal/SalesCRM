import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

export const getDashboardOverview = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const unassignedLeads = await Lead.countDocuments({ assignedEmployee: null });
    const closedLeads = await Lead.countDocuments({ status: "Closed" });

    // This week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const assignedThisWeek = await Lead.countDocuments({
      assignedEmployee: { $ne: null },
      receivedDate: { $gte: startOfWeek },
    });

    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

    // Active salespeople
    const today = todayIST();
    const activeTimings = await Timing.find({
      date: today,
      checkIn: { $ne: null },
      checkOut: null,
      status: { $ne: "Inactive" },
    }).distinct("employee");
    const activeSalespeople = activeTimings.length;

    // Recent Activities — deduplicated, sorted
    const recentLeads = await Lead.find()
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate("assignedEmployee", "firstName lastName");

    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const activityMap = new Map();

    recentEmployees.forEach((emp) => {
      const key = `employee-${emp._id}`;
      const message = `Employee added: ${emp.firstName} ${emp.lastName}`;
      activityMap.set(key, { message, time: emp.createdAt });
    });

    recentLeads.forEach((lead) => {
      const assignedName = lead.assignedEmployee?.firstName || "Someone";
      const keyBase = `lead-${lead._id}`;
      const latestCall = lead.scheduledCalls?.[lead.scheduledCalls.length - 1];
      const callDate = latestCall?.callDate ? new Date(latestCall.callDate) : null;
      const now = new Date();

      let finalMessage = "";
      let finalTime = new Date(lead.updatedAt);

      if (lead.status === "Closed") {
        finalMessage = `${assignedName} closed lead: ${lead.name}`;
        finalTime = lead.updatedAt;
        activityMap.set(`${keyBase}-closed`, { message: finalMessage, time: finalTime });
      } else if (callDate && callDate >= now && lead.assignedEmployee) {
        finalMessage = `${assignedName} scheduled call for ${lead.name}`;
        finalTime = callDate;
        activityMap.set(`${keyBase}-call`, { message: finalMessage, time: finalTime });
      } else if (lead.assignedEmployee) {
        finalMessage = `Lead assigned to ${assignedName}: ${lead.name}`;
        finalTime = lead.updatedAt;
        activityMap.set(`${keyBase}-assigned`, { message: finalMessage, time: finalTime });
      } else {
        finalMessage = `Lead added: ${lead.name}`;
        finalTime = lead.createdAt;
        activityMap.set(`${keyBase}-added`, { message: finalMessage, time: finalTime });
      }
    });

    const recentActivities = Array.from(activityMap.values())
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    // Graph Data (last 10 days)
    const todayDate = new Date();
    const graphData = [];

    for (let i = 9; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dailyLeads = await Lead.find({
        receivedDate: { $gte: date, $lt: nextDate },
      });

      const total = dailyLeads.length;
      const closed = dailyLeads.filter((l) => l.status === "Closed").length;
      const conversion = total > 0 ? Math.round((closed / total) * 100) : 0;

      graphData.push({
        date: date.toISOString().split("T")[0],
        conversion,
        closedLeads: closed,
      });
    }

    // Enriched Employees
    const enrichedEmployees = await Promise.all(
      (await Employee.find()).map(async (emp) => {
        const assignedLeads = await Lead.countDocuments({ assignedEmployee: emp._id });
        const closed = await Lead.countDocuments({
          assignedEmployee: emp._id,
          status: "Closed",
        });

        const timing = await Timing.findOne({ employee: emp._id, date: today });
        let status = "Inactive";

        if (timing && timing.checkIn && !timing.checkOut && timing.status !== "Inactive") {
          status = "Active";
        }

        return {
          ...emp.toObject(),
          assignedLeads,
          closedLeads: closed,
          status,
        };
      })
    );

    // Final Response
    res.status(200).json({
      unassignedLeads,
      assignedThisWeek,
      activeSalespeople,
      conversionRate,
      recentActivities,
      graphData,
      employees: enrichedEmployees,
    });
  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};
