// backend/controllers/activityController.js
import Lead from "../models/lead.js";
import Employee from "../models/employee.js";

// ✅ 1. Employee personal activity
export const getEmployeeActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const leads = await Lead.find({
      assignedEmployee: id,
    })
      .sort({ updatedAt: -1 })
      .limit(15);

    const leadActivities = leads.map((lead) => {
      if (lead.status === "Closed") {
        return {
          message: `You closed lead: ${lead.name}`,
          time: lead.updatedAt,
        };
      }

      if (lead.status === "Scheduled") {
        return {
          message: `You scheduled a call with: ${lead.name}`,
          time: lead.updatedAt,
        };
      }

      return {
        message: `You were assigned: ${lead.name}`,
        time: lead.updatedAt,
      };
    });

    const allActivities = leadActivities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    res.status(200).json(allActivities);
  } catch (err) {
    console.error("Employee activity fetch error:", err);
    res.status(500).json({ error: "Failed to fetch employee activity" });
  }
};

// ✅ 2. Admin recent activity
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
