import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

export const getDashboardOverview = async (req, res) => {
  try {
    
    const totalLeads = await Lead.countDocuments();
    const unassignedLeads = await Lead.countDocuments({ assignedEmployee: null });
    const closedLeads = await Lead.countDocuments({ status: "Closed" });

    const conversionRate = totalLeads > 0
      ? Math.round((closedLeads / totalLeads) * 100)
      : 0;

 
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const assignedThisWeek = await Lead.countDocuments({
      assignedEmployee: { $ne: null },
      receivedDate: { $gte: startOfWeek },
    });


    const today = todayIST();
    const activeTimings = await Timing.find({
      date: today,
      checkIn: { $ne: null },
      checkOut: null,
      status: { $ne: "Inactive" },
    }).distinct("employee");
    const activeSalespeople = activeTimings.length;

 
    const recentLeads = await Lead.find()
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate("assignedEmployee", "firstName lastName");

    const recentEmployees = await Employee.find()
      .sort({ updatedAt: -1 })
      .limit(30);

    const activityMap = new Map();


    recentEmployees.forEach((emp) => {
      const created = new Date(emp.createdAt).getTime();
      const updated = new Date(emp.updatedAt).getTime();
      const key = created === updated ? "add" : "edit";
      const message = `Employee ${key === "add" ? "added" : "edited"}: ${emp.firstName} ${emp.lastName}`;

      activityMap.set(`emp-${emp._id}-${key}`, {
        message,
        time: key === "add" ? emp.createdAt : emp.updatedAt,
      });
    });

    recentLeads.forEach((lead) => {
      const keyBase = `lead-${lead._id}`;
      const assignedName = lead.assignedEmployee?.firstName || "Someone";
      const createdAt = new Date(lead.createdAt).getTime();
      const updatedAt = new Date(lead.updatedAt).getTime();

      if (lead.status === "Closed") {
        activityMap.set(`${keyBase}-closed`, {
          message: `${assignedName} closed lead: ${lead.name}`,
          time: lead.updatedAt,
        });
      } else if (lead.assignedEmployee && createdAt !== updatedAt) {
        activityMap.set(`${keyBase}-assigned`, {
          message: `Lead assigned to ${assignedName}: ${lead.name}`,
          time: lead.updatedAt,
        });
      } else {
        activityMap.set(`${keyBase}-added`, {
          message: `Lead added: ${lead.name}`,
          time: lead.createdAt,
        });
      }
    });

    const recentActivities = Array.from(activityMap.values())
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    // Last 10 Days Graph
    const graphData = [];
    const todayDate = new Date();

    for (let i = 9; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const leads = await Lead.find({
        receivedDate: { $gte: date, $lt: nextDate },
      });

      const total = leads.length;
      const closed = leads.filter((l) => l.status === "Closed").length;
      const conversion = total > 0 ? Math.round((closed / total) * 100) : 0;

      graphData.push({
        date: date.toISOString().split("T")[0],
        closedLeads: closed,
        conversion,
      });
    }

    const allEmployees = await Employee.find();
    const enrichedEmployees = await Promise.all(
      allEmployees.map(async (emp) => {
        const assignedLeads = await Lead.countDocuments({ assignedEmployee: emp._id });
        const closedLeads = await Lead.countDocuments({
          assignedEmployee: emp._id,
          status: "Closed",
        });

        const timing = await Timing.findOne({ employee: emp._id, date: today });

        let status = "Inactive";
        if (timing && timing.checkIn && !timing.checkOut) {
          status = "Active";
        }

        return {
          ...emp.toObject(),
          assignedLeads,
          closedLeads,
          status,
        };
      })
    );

  
    res.status(200).json({
      unassignedLeads,
      assignedThisWeek,
      activeSalespeople,
      conversionRate,
      recentActivities,
      graphData,
      employees: enrichedEmployees,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};
