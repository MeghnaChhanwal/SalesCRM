import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import Timing from "../models/timing.js";
import { todayIST } from "../utils/time.js";

const isActiveTiming = (timing) =>
  timing &&
  timing.checkIn &&
  (!timing.checkOut || timing.checkOut.trim() === "") &&
  timing.status !== "Inactive";

export const getDashboardOverview = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const unassignedLeads = await Lead.countDocuments({ assignedEmployee: null });
    const closedLeads = await Lead.countDocuments({ status: "Closed" });

    const conversionRate = totalLeads > 0
      ? Math.round((closedLeads / totalLeads) * 100)
      : 0;

    // Start of current week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const assignedThisWeek = await Lead.countDocuments({
      assignedEmployee: { $ne: null },
      receivedDate: { $gte: startOfWeek },
    });

    const today = todayIST();

    // Employee stats with status
    const allEmployees = await Employee.find();
    let activeSalespeople = 0;

    const enrichedEmployees = await Promise.all(
      allEmployees.map(async (emp) => {
        const assignedLeads = await Lead.countDocuments({ assignedEmployee: emp._id });
        const closedLeads = await Lead.countDocuments({
          assignedEmployee: emp._id,
          status: "Closed",
        });

        const timing = await Timing.findOne({ employee: emp._id, date: today });
        const status = isActiveTiming(timing) ? "Active" : "Inactive";

        if (status === "Active") activeSalespeople++;

        return {
          ...emp.toObject(),
          assignedLeads,
          closedLeads,
          status,
        };
      })
    );

    // Recent Activities (Lead added / assigned / closed)
    const recentLeads = await Lead.find()
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate("assignedEmployee", "firstName lastName");

    const activityMap = new Map();

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

    // Graph Data - last 10 days (closed leads per day)
    const graphData = [];
    const todayDate = new Date();

    for (let i = 9; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const now = new Date();
      const upperLimit = (date.toDateString() === now.toDateString()) ? now : nextDate;

      const closedLeadsCount = await Lead.countDocuments({
        status: "Closed",
        receivedDate: {
          $gte: date,
          $lt: upperLimit,
        },
      });

      graphData.push({
        date: date.toISOString().split("T")[0],
        sales: closedLeadsCount,
      });
    }

    // Final response
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
