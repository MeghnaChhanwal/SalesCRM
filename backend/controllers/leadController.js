import fs from "fs";
import csv from "csv-parser";
import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import { prepareLeadDistribution, assignEmployeeByConditions } from "../utils/assign.js";

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
    console.error("Failed to fetch leads:", err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

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
      status: status || "Open",
      type: type || "Warm",
      receivedDate: new Date(),
      assignedEmployee: assignedEmployee || null
    });

    await newLead.save();
    res.status(201).json({ message: "Lead added successfully", lead: newLead });
  } catch (error) {
    console.error("Error adding manual lead:", error);
    res.status(500).json({ error: "Failed to add lead" });
  }
};

export const uploadCSV = async (req, res) => {
  const filePath = req.file.path;
  const leads = [];
  const requiredFields = ["name", "email", "phone", "language", "location"];
  let invalidRows = 0;

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

    const { maxPerEmployee } = await prepareLeadDistribution(validRows.length);

    for (const row of validRows) {
      const assignedEmployee = await assignEmployeeByConditions(row, maxPerEmployee);
      leads.push({
        name: row.name,
        email: row.email || null,
        phone: row.phone || null,
        receivedDate: row.receivedDate ? new Date(row.receivedDate) : new Date(),
        status: row.status || "Open",
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
    console.error("Error uploading leads:", error);
    res.status(500).json({ error: "Error uploading leads" });
  }
};

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
  } catch (err) {
    res.status(500).json({ error: "Failed to update lead status" });
  }
};

export const scheduleCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { callDate, callType } = req.body;

    const sameTimeLead = await Lead.findOne({ "scheduledCalls.callDate": new Date(callDate) });
    if (sameTimeLead) {
      return res.status(400).json({ error: "A lead is already scheduled at this time" });
    }

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    lead.scheduledCalls = lead.scheduledCalls || [];
    lead.scheduledCalls.push({ callDate: new Date(callDate), callType });
    await lead.save();

    res.status(200).json({ message: "Call scheduled", lead });
  } catch (err) {
    res.status(500).json({ error: "Failed to schedule call" });
  }
};
