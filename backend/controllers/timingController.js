import Lead from "../models/lead.js";
import Employee from "../models/employee.js";

export const getDashboardOverview = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const unassignedLeads = await Lead.countDocuments({ assignedEmployee: null });
    const closedLeads = await Lead.countDocuments({ status: "Closed" });
    const activeSalespeople = await Employee.countDocuments({ status: "Active" });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const assignedThisWeek = await Lead.countDocuments({
      assignedEmployee: { $ne: null },
      receivedDate: { $gte: startOfWeek }
    });

    const conversionRate = totalLeads > 0
      ? Math.round((closedLeads / totalLeads) * 100)
      : 0;

    // 👉 Lead related activities
    const recentLeads = await Lead.find({})
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate("assignedEmployee", "firstName lastName");

    const activities = [];

    for (const lead of recentLeads) {
      if (!lead.assignedEmployee) {
        activities.push({
          text: `Lead added: ${lead.name}`,
          timestamp: lead.receivedDate
        });
      } else if (lead.status === "Closed") {
        activities.push({
          text: `${lead.assignedEmployee.firstName} closed lead: ${lead.name}`,
          timestamp: lead.updatedAt
        });
      } else {
        activities.push({
          text: `Lead assigned to ${lead.assignedEmployee.firstName}: ${lead.name}`,
          timestamp: lead.updatedAt
        });
      }

      // 👉 optional: scheduled call activity (if you want)
      if (lead.scheduledCalls?.length > 0) {
        const latestCall = lead.scheduledCalls[lead.scheduledCalls.length - 1];
        activities.push({
          text: `Call scheduled for ${lead.name}`,
          timestamp: latestCall.callDate
        });
      }
    }

    // 👉 Sort and limit to latest 10 activities
    const recentActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
      .map((act) => ({
        ...act,
        ago: timeAgo(act.timestamp)
      }));

    res.status(200).json({
      unassignedLeads,
      assignedThisWeek,
      activeSalespeople,
      conversionRate,
      recentActivities
    });

  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// Helper to format timestamp
function timeAgo(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours} hr ago`;
}
