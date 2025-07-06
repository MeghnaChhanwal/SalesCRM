import Lead from "../models/lead.js";

// ✅ Employee personal activity (only lead-related)
export const getEmployeeActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const leads = await Lead.find({
      assignedEmployee: id,
    })
      .sort({ updatedAt: -1 })
      .limit(15); // increased to 15 for more context

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

    // Sort by most recent activity
    const allActivities = leadActivities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10); // limit final result to 10

    res.status(200).json(allActivities);
  } catch (err) {
    console.error("Employee activity fetch error:", err);
    res.status(500).json({ error: "Failed to fetch employee activity" });
  }
};
