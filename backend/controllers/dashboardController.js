import Lead from "../models/lead.js";
import Employee from "../models/employee.js";

export const getDashboardOverview = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const unassignedLeads = await Lead.countDocuments({
      assignedEmployee: null,
    });
    const closedLeads = await Lead.countDocuments({ status: "Closed" });
    const activeSalespeople = await Employee.countDocuments({
      status: "Active",
    });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const assignedThisWeek = await Lead.countDocuments({
      assignedEmployee: { $ne: null },
      receivedDate: { $gte: startOfWeek },
    });

    const conversionRate =
      totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

    const recentLeads = await Lead.find({})
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate("assignedEmployee", "firstName lastName");

    const recentEmployees = await Employee.find({})
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
          message: `${
            lead.assignedEmployee?.firstName || "Someone"
          } scheduled call for ${lead.name}`,
          time: latestCall.callDate,
        });
      }
    });

    const recentActivities = activity
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    // 👉 Graph data
    const today = new Date();
    const graphData = [];

    for (let i = 9; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
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

    res.status(200).json({
      unassignedLeads,
      assignedThisWeek,
      activeSalespeople,
      conversionRate,
      recentActivities,
      graphData,
      employees: await Employee.find({}),
    });
  } catch (err) {
    console.error("❌ Dashboard overview error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

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

      const leads = await Lead.find({
        receivedDate: { $gte: date, $lt: nextDate },
      });

      const total = leads.length;
      const closed = leads.filter((l) => l.status === "Closed").length;
      const conversion = total > 0 ? Math.round((closed / total) * 100) : 0;

      chartData.push({
        date: date.toISOString().split("T")[0],
        totalLeads: total,
        closedLeads: closed,
        conversionRate: conversion,
      });
    }

    res.status(200).json(chartData);
  } catch (err) {
    console.error("❌ Chart data error:", err);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
};
