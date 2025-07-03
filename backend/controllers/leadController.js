import fs from "fs";
import csv from "csv-parser";
import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import { prepareLeadDistribution, assignEmployeeByConditions } from "../utils/assign.js";

// GET: All leads with search, pagination, sort, filter
export const getLeads = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 7,
      sortBy = "receivedDate",
      order = "desc",
      filter = ""
    } = req.query;

    const skip = (page - 1) * limit;
    const regex = new RegExp(search, "i");

    const query = {
      $and: [
        {
          $or: [
            { name: { $regex: regex } },
            { email: { $regex: regex } },
            { phone: { $regex: regex } },
            { location: { $regex: regex } },
            { status: { $regex: regex } }
          ]
        },
        filter ? { status: filter } : {}
      ]
    };

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("assignedEmployee", "firstName lastName");

    res.status(200).json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalLeads: total
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

// POST: Manually add a lead
export const addLeadManually = async (req, res) => {
  try {
    const { name, email, phone, language, location, status, type } = req.body;

    if (!name || !language || !location) {
      return res.status(400).json({ error: "Name, language, and location are required" });
    }

    const { maxPerEmployee } = await prepareLeadDistribution(1);
    const assignedEmployee = await assignEmployeeByConditions({ language, location }, maxPerEmployee);

    const newLead = new Lead({
      name,
      email: email || null,
      phone: phone || null,
      language,
      location,
      status: status || "Ongoing",
      type: type || "Warm",
      receivedDate: new Date(),
      assignedEmployee: assignedEmployee || null
    });

    await newLead.save();
    res.status(201).json({ message: "Lead added successfully", lead: newLead });
  } catch (error) {
    res.status(500).json({ error: "Failed to add lead" });
  }
};

// POST: Upload leads from CSV
export const uploadCSV = async (req, res) => {
  const filePath = req.file.path;
  const leads = [];
  const requiredFields = ["name", "email", "phone", "language", "location"];

  try {
    const allRows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => allRows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    const validRows = allRows.filter((row) =>
      requiredFields.every((f) => row[f] && row[f].trim() !== "")
    );

    const invalidRows = allRows.length - validRows.length;
    const { maxPerEmployee } = await prepareLeadDistribution(validRows.length);

    for (const row of validRows) {
      const assignedEmployee = await assignEmployeeByConditions(row, maxPerEmployee);
      leads.push({
        name: row.name,
        email: row.email || null,
        phone: row.phone || null,
        receivedDate: row.receivedDate ? new Date(row.receivedDate) : new Date(),
        status: row.status || "Ongoing",
        type: row.type || "Warm",
        language: row.language,
        location: row.location,
        assignedEmployee: assignedEmployee || null
      });
    }

    await Lead.insertMany(leads);
    fs.unlinkSync(filePath);

    res.status(200).json({ message: "Leads uploaded successfully", uploaded: leads.length, invalidRows });
  } catch (error) {
    res.status(500).json({ error: "Error uploading leads" });
  }
};

// PUT: Update type
export const updateLeadType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!["Hot", "Warm", "Cold"].includes(type)) {
      return res.status(400).json({ error: "Invalid lead type" });
    }

    const lead = await Lead.findByIdAndUpdate(id, { type }, { new: true });
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    res.status(200).json({ message: "Lead type updated", lead });
  } catch {
    res.status(500).json({ error: "Failed to update lead type" });
  }
};

// PUT: Update status
export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    const hasFutureCall = lead.scheduledCalls?.some((call) => new Date(call.callDate) > new Date());
    if (status === "Closed" && hasFutureCall) {
      return res.status(400).json({ error: "Cannot close lead with upcoming scheduled call" });
    }

    lead.status = status;
    await lead.save();

    res.status(200).json({ message: "Lead status updated", lead });
  } catch {
    res.status(500).json({ error: "Failed to update lead status" });
  }
};

// POST: Schedule a call
export const scheduleCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { callDate } = req.body;

    const existing = await Lead.findOne({ "scheduledCalls.callDate": new Date(callDate) });
    if (existing) {
      return res.status(400).json({ error: "A lead is already scheduled at this time" });
    }

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    const autoCallType = lead.type === "Cold" ? "Cold Call" : "Referral";

    lead.scheduledCalls = lead.scheduledCalls || [];
    lead.scheduledCalls.push({ callDate: new Date(callDate), callType: autoCallType });

    await lead.save();

    res.status(200).json({ message: "Call scheduled", lead });
  } catch {
    res.status(500).json({ error: "Failed to schedule call" });
  }
};

// GET: Scheduled calls (all or today's)
export const getScheduledCalls = async (req, res) => {
  try {
    const { filter = "all" } = req.query;
    let leads;

    if (filter === "today") {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = new Date(today.setHours(23, 59, 59, 999));

      leads = await Lead.find({
        scheduledCalls: {
          $elemMatch: {
            callDate: { $gte: start, $lte: end },
          },
        },
      });
    } else {
      leads = await Lead.find({
        scheduledCalls: { $exists: true, $not: { $size: 0 } }
      });
    }

    res.status(200).json({ leads });
  } catch {
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
};
