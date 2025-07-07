import fs from "fs";
import csv from "csv-parser";
import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import {
  prepareLeadDistribution,
  assignEmployeeByConditions,
} from "../utils/assign.js";


// ✅ GET: All leads (with search, filter, sort, pagination)
export const getLeads = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 6,
      sortBy = "receivedDate",
      order = "desc",
      filter = "",
      assignedEmployee = null,
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
            { status: { $regex: regex } },
          ],
        },
        filter ? { status: filter } : {},
        assignedEmployee ? { assignedEmployee } : {},
      ],
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
      totalLeads: total,
    });
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};


// ✅ POST: Manually add lead
export const addLeadManually = async (req, res) => {
  try {
    const { name, email, phone, language, location, status, type } = req.body;

    if (!name || !language || !location) {
      return res.status(400).json({ error: "Name, language, and location are required" });
    }

    const { employees, maxPerEmployee, tempLeadMap } = await prepareLeadDistribution(1);
    const assignedEmployee = await assignEmployeeByConditions(
      { language, location },
      maxPerEmployee,
      employees,
      tempLeadMap
    );

    const newLead = new Lead({
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      language,
      location,
      status: status || "Ongoing",
      type: type || "Warm",
      receivedDate: new Date(),
      assignedEmployee: assignedEmployee || null,
    });

    await newLead.save();
    res.status(201).json({ message: "Lead added successfully", lead: newLead });
  } catch (error) {
    console.error("Add Lead Error:", error);
    res.status(500).json({ error: "Failed to add lead" });
  }
};


// ✅ POST: Upload leads via CSV
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

    const { employees, maxPerEmployee, tempLeadMap } = await prepareLeadDistribution(validRows.length);

    for (const row of validRows) {
      // Avoid duplicates
      const existing = await Lead.findOne({
        $or: [{ email: row.email }, { phone: row.phone }],
      });
      if (existing) continue;

      const assignedEmployee = await assignEmployeeByConditions(
        row,
        maxPerEmployee,
        employees,
        tempLeadMap
      );

      leads.push({
        name: row.name.trim(),
        email: row.email?.trim() || null,
        phone: row.phone?.trim() || null,
        receivedDate: row.receivedDate ? new Date(row.receivedDate) : new Date(),
        status: row.status || "Ongoing",
        type: row.type || "Warm",
        language: row.language,
        location: row.location,
        assignedEmployee: assignedEmployee || null,
      });
    }

    await Lead.insertMany(leads);
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: "Leads uploaded successfully",
      uploaded: leads.length,
      invalidRows,
    });
  } catch (error) {
    console.error("Upload CSV Error:", error);
    res.status(500).json({ error: "Error uploading leads" });
  }
};


// ✅ PATCH: Update lead type
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
  } catch (error) {
    console.error("Update Lead Type Error:", error);
    res.status(500).json({ error: "Failed to update lead type" });
  }
};


// ✅ PATCH: Update lead status
export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Ongoing", "Closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    const now = new Date();

    const hasFutureCall = lead.scheduledCalls?.some(
      (call) => new Date(call.callDate) > now
    );

    if (status === "Closed" && hasFutureCall) {
      return res
        .status(400)
        .json({ error: "Cannot close lead with upcoming scheduled call" });
    }

    if (status === "Closed") {
      lead.scheduledCalls = lead.scheduledCalls.filter(
        (call) => new Date(call.callDate) <= now
      );
    }

    lead.status = status;
    await lead.save();

    res.status(200).json({ message: "Lead status updated", lead });
  } catch (error) {
    console.error("Lead Status Update Error:", error);
    res.status(500).json({ error: "Failed to update lead status" });
  }
};


// ✅ POST: Schedule a call
export const scheduleCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { callDate } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    if (lead.status === "Closed") {
      return res.status(400).json({ error: "Cannot schedule call for closed lead" });
    }

    const parsedDate = new Date(callDate);
    parsedDate.setSeconds(0, 0);

    const existing = await Lead.findOne({
      "scheduledCalls.callDate": parsedDate,
    });

    if (existing) {
      return res.status(400).json({ error: "Another call already scheduled at this time" });
    }

    const autoCallType = lead.type === "Cold" ? "Cold Call" : "Referral";

    lead.scheduledCalls = lead.scheduledCalls || [];
    lead.scheduledCalls.push({
      callDate: parsedDate,
      callType: autoCallType,
    });

    await lead.save();
    res.status(200).json({ message: "Call scheduled", lead });
  } catch (error) {
    console.error("Schedule Call Error:", error);
    res.status(500).json({ error: "Failed to schedule call" });
  }
};


// ✅ GET: Fetch scheduled calls (today or upcoming)
// ✅ GET: Fetch scheduled calls (today or upcoming)
export const getScheduledCalls = async (req, res) => {
  try {
    const { filter = "all" } = req.query;
    let leads;

    if (filter === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      leads = await Lead.find({
        status: { $ne: "Closed" }, // 🔹 Exclude closed leads
        scheduledCalls: {
          $elemMatch: {
            callDate: { $gte: start, $lte: end },
          },
        },
      }).populate("assignedEmployee", "firstName lastName");
    } else {
      leads = await Lead.find({
        status: { $ne: "Closed" }, // 🔹 Exclude closed leads
        scheduledCalls: {
          $elemMatch: {
            callDate: { $gte: new Date() },
          },
        },
      }).populate("assignedEmployee", "firstName lastName");
    }

    res.status(200).json({ leads });
  } catch (error) {
    console.error("Get Scheduled Calls Error:", error);
    res.status(500).json({ error: "Failed to fetch scheduled calls" });
  }
};
