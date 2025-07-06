import Employee from "../models/employee.js"; // Add this at the top if not already

export const getAdminRecentActivities = async (req, res) => {
  try {
    const recentLeads = await Lead.find()
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate("assignedEmployee", "firstName lastName");

    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const activity = [];

    recentEmployees.forEach((emp) => {
      activity.push({
        message: `Employee added: ${emp.firstName} ${emp.lastName}`,
        time: emp.createdAt,
      });
    });

    recentLeads.forEach((lead) => {
      if (!lead.assignedEmployee) {
        activity.push({
          message: `Lead added: ${lead.name}`,
          time: lead.createdAt,
        });
      } else if (lead.status === "Closed") {
        activity.push({
          message: `${lead.assignedEmployee.firstName} closed lead: ${lead.name}`,
          time: lead.updatedAt,
        });
      } else {
        activity.push({
          message: `Lead assigned to ${lead.assignedEmployee.firstName}: ${lead.name}`,
          time: lead.updatedAt,
        });
      }

      if (lead.scheduledCalls?.length > 0) {
        const latestCall = lead.scheduledCalls[lead.scheduledCalls.length - 1];
        activity.push({
          message: `${lead.assignedEmployee?.firstName || "Someone"} scheduled call for ${lead.name}`,
          time: latestCall.callDate,
        });
      }
    });

    const recentActivities = activity
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    res.status(200).json(recentActivities);
  } catch (err) {
    console.error("Admin activity fetch error:", err);
    res.status(500).json({ error: "Failed to fetch admin recent activities" });
  }
};
