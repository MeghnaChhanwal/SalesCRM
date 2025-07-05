import Lead from "../models/lead.js";
import Employee from "../models/employee.js";

export const getDashboardOverview = async (req, res) => {
  try {
    // 👉 Counts
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

    // 👉 Recent leads & employees
    const recentLeads = await Lead.find({})
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate("assignedEmployee", "firstName lastName");

    const recentEmployees = await Employee.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    // 👉 Activity list
    const activity = [];

    // Employee creation
    recentEmployees.forEach(emp => {
      activity.push({
        text: `Employee added: ${emp.firstName} ${emp.lastName}`,
        timestamp: emp.createdAt
      });
    });

    // Lead actions
    recentLeads.forEach(lead => {
      if (!lead.assignedEmployee) {
        activity.push({
          text: `Lead added: ${lead.name}`,
          timestamp: lead.receivedDate
        });
      } else if (lead.status === "Closed") {
        activity.push({
          text: `${lead.assignedEmployee.firstName} closed lead: ${lead.name}`,
          timestamp: lead.updatedAt
        });
      } else {
        activity.push({
          text: `Lead assigned to ${lead.assignedEmployee.firstName}: ${lead.name}`,
          timestamp: lead.updatedAt
        });
      }

      if (lead.scheduledCalls?.length > 0) {
        const latestCall = lead.scheduledCalls[lead.scheduledCalls.length - 1];
        activity.push({
          text: `${lead.assignedEmployee?.firstName || "Someone"} scheduled call for ${lead.name}`,
          timestamp: latestCall.callDate
        });
      }
    });

    // Sort + slice
    const recentActivities = activity
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
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
        receivedDate: { $gte: date, $lt: nextDate }
      });

      const total = dailyLeads.length;
      const closed = dailyLeads.filter(l => l.status === "Closed").length;
      const conversion = total > 0 ? Math.round((closed / total) * 100) : 0;

      graphData.push({
        date: date.toISOString().split("T")[0],
        conversion
      });
    }

    res.status(200).json({
      unassignedLeads,
      assignedThisWeek,
      activeSalespeople,
      conversionRate,
      recentActivities,
      graphData
    });

  } catch (err) {
    console.error("❌ Dashboard overview error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// Optional: Chart data route (if needed separately)
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
        receivedDate: { $gte: date, $lt: nextDate }
      });

      const total = leads.length;
      const closed = leads.filter(l => l.status === "Closed").length;
      const conversion = total > 0 ? Math.round((closed / total) * 100) : 0;

      chartData.push({
        date: date.toISOString().split("T")[0],
        totalLeads: total,
        closedLeads: closed,
        conversionRate: conversion
      });
    }

    res.status(200).json(chartData);

  } catch (err) {
    console.error("❌ Chart data error:", err);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
};
