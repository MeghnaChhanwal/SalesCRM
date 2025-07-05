import Lead from "../models/lead.js";
import Timing from "../models/timing.js";
import Employee from "../models/employee.js";

// ✅ Admin dashboard recent activities
export const getAdminRecentActivities = async (req, res) => {
  try {
    const recentLeads = await Lead.find({})
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate("assignedEmployee", "firstName lastName");

    const activities = recentLeads.map((lead) => {
      if (!lead.assignedEmployee) {
        return {
          message: `Lead added: ${lead.name}`,
          time: lead.createdAt
        };
      } else if (lead.status === "Closed") {
        return {
          message: `${lead.assignedEmployee.firstName} closed lead: ${lead.name}`,
          time: lead.updatedAt
        };
      } else {
        return {
          message: `Lead assigned to ${lead.assignedEmployee.firstName}: ${lead.name}`,
          time: lead.updatedAt
        };
      }
    });

    res.status(200).json(activities.slice(0, 10));
  } catch (err) {
    console.error("Admin recent activity error:", err);
    res.status(500).json({ error: "Failed to fetch admin activity" });
  }
};

// ✅ Employee personal activity
export const getEmployeeActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const leads = await Lead.find({
      assignedEmployee: id
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    const leadActivities = leads.map(lead => ({
      message: lead.status === "Closed"
        ? `You closed lead: ${lead.name}`
        : `Working on lead: ${lead.name}`,
      time: lead.updatedAt
    }));

    const timing = await Timing.find({ employee: id })
      .sort({ createdAt: -1 })
      .limit(2);

    const timingActivities = timing.flatMap(t => {
      const acts = [];
      if (t.checkIn) {
        acts.push({
          message: "Checked in",
          time: t.createdAt
        });
      }
      if (t.checkOut) {
        acts.push({
          message: "Checked out",
          time: t.updatedAt
        });
      }
      return acts;
    });

    const allActivities = [...leadActivities, ...timingActivities]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    res.status(200).json(allActivities);

  } catch (err) {
    console.error("Employee activity fetch error:", err);
    res.status(500).json({ error: "Failed to fetch employee activity" });
  }
};
