import Lead from "../models/lead.js";
import Employee from "../models/employee.js";

// 🔹 GET /api/dashboard/overview
export const getDashboardOverview = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const unassignedLeads = await Lead.countDocuments({ assignedEmployee: null });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const assignedThisWeek = await Lead.countDocuments({
      assignedEmployee: { $ne: null },
      receivedDate: { $gte: startOfWeek },
    });

    const activeSalespeople = await Employee.countDocuments({ status: "Active" });

    const closedLeads = await Lead.countDocuments({ status: "Closed" });
    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

    res.status(200).json({
      totalLeads,
      unassignedLeads,
      assignedThisWeek,
      activeSalespeople,
      conversionRate,
    });
  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// 🔹 GET /api/dashboard/activity - latest 10 activity logs
export const getRecentActivity = async (req, res) => {
  try {
    const recentLeads = await Lead.find({})
      .sort({ receivedDate: -1 })
      .limit(20)
      .populate("assignedEmployee", "firstName lastName");

    const activity = [];

    for (const lead of recentLeads) {
      if (!lead.assignedEmployee) {
        activity.push({
          message: `➕ Lead added: ${lead.name}`,
          timestamp: lead.receivedDate,
        });
      } else if (lead.status === "Closed") {
        activity.push({
          message: `🎯 ${lead.assignedEmployee.firstName} closed lead: ${lead.name}`,
          timestamp: lead.receivedDate,
        });
      } else {
        activity.push({
          message: `✅ Lead assigned to ${lead.assignedEmployee.firstName}`,
          timestamp: lead.receivedDate,
        });
      }
    }

    const top10 = activity.slice(0, 10);

    res.status(200).json(top10);
  } catch (err) {
    console.error("Activity fetch error:", err);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
};

// 🔹 GET /api/dashboard/chart - sales chart data (7-14 days)
export const getChartData = async (req, res) => {
  try {
    const { days = 10 } = req.query;
    const numDays = Math.min(Math.max(Number(days), 7), 14);

    const today = new Date();
    const chartData = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dailyLeads = await Lead.find({
        receivedDate: { $gte: date, $lt: nextDate },
      });

      const totalLeads = dailyLeads.length;
      const closedLeads = dailyLeads.filter(l => l.status === "Closed").length;
      const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

      chartData.push({
        date: date.toISOString().split("T")[0],
        totalLeads,
        closedLeads,
        conversionRate,
      });
    }

    res.status(200).json(chartData);
  } catch (err) {
    console.error("Chart data error:", err);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
};
