import Lead from "../models/lead.js";
import Employee from "../models/employee.js";


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
    const employees = await Employee.find().sort({ createdAt: -1 });

    const closedLeads = await Lead.countDocuments({ status: "Closed" });
    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

    // 🔸 Recent Activity
    const recentLeads = await Lead.find({})
      .sort({ receivedDate: -1 })
      .limit(20)
      .populate("assignedEmployee", "firstName lastName");

    const activity = [];

    for (const lead of recentLeads) {
      if (!lead.assignedEmployee) {
        activity.push(` Lead added: ${lead.name}`);
      } else if (lead.status === "Closed") {
        activity.push(`${lead.assignedEmployee.firstName} closed lead: ${lead.name}`);
      } else {
        activity.push(`Lead assigned to ${lead.assignedEmployee.firstName}`);
      }
    }

    const recentActivities = activity.slice(0, 10);

   
    const today = new Date();
    const chartData = [];

    for (let i = 9; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dailyLeads = await Lead.find({
        receivedDate: { $gte: date, $lt: nextDate },
      });

      const dailyTotal = dailyLeads.length;
      const dailyClosed = dailyLeads.filter((l) => l.status === "Closed").length;
      const dailyConversion = dailyTotal > 0 ? Math.round((dailyClosed / dailyTotal) * 100) : 0;

      chartData.push({
        date: date.toISOString().split("T")[0],
        conversion: dailyConversion,
      });
    }

    res.status(200).json({
      unassignedLeads,
      assignedThisWeek,
      activeSalespeople,
      conversionRate,
      recentActivities,
      graphData: chartData,
      employees,
    });
  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// 🔹 GET /api/dashboard/chart - sales chart data (7–14 days)
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
