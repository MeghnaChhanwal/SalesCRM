import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

export const getDashboardOverview = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const unassignedLeads = await Lead.countDocuments({ assignedEmployee: null });
    const closedLeads = await Lead.countDocuments({ status: "Closed" });

    // This week assigned
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const assignedThisWeek = await Lead.countDocuments({
      assignedEmployee: { $ne: null },
      receivedDate: { $gte: startOfWeek },
    });

    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

    // Active salespeople today
    const today = todayIST();
    const activeTimings = await Timing.find({
      date: today,
      checkIn: { $ne: null },
      checkOut: null,
      status: { $ne: "Inactive" },
    }).distinct("employee");
    const activeSalespeople = activeTimings.length;

    // Recent Activities (only useful)
    const recentLeads = await Lead.find()
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate("assignedEmployee", "firstName lastName");

    const recentEmployees = await Employee.find()
      .sort({ updatedAt: -1 })
      .limit(30);

    const activityMap = new Map();

    // Employee add/edit
    recentEmployees.forEach((emp) => {
      const created = new Date(emp.createdAt).getTime();
      const updated = new Date(emp.updatedAt).getTime();

      if (created === updated) {
        activityMap.set(`emp-${emp._id}-add`, {
          message: `Employee added: ${emp.firstName} ${emp.lastName}`,
          time: emp.createdAt,
        });
      } else {
        activityMap.set(`emp-${emp._id}-edit`, {
          message: `Employee edited: ${emp.firstName} ${emp.lastName}`,
          time: emp.updatedAt,
        });
      }
    });

    // Lead add / assign / close
    recentLeads.forEach((lead) => {
      const assignedName = lead.assignedEmployee?.firstName || "Someone";
      const keyBase = `lead-${lead._id}`;
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
      } else if (!lead.assignedEmployee) {
        activityMap.set(`${keyBase}-added`, {
          message: `Lead added: ${lead.name}`,
          time: lead.createdAt,
        });
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

    // Employee Table Data with status
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
