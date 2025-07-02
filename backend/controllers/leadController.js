import fs from "fs";
import csv from "csv-parser";
import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import {
  prepareLeadDistribution,
  assignEmployeeByConditions
} from "../utils/assign.js";

// ✅ GET /api/leads - Fetch leads with search, sort, pagination
export const getLeads = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 8,
      sortBy = "receivedDate",
      order = "desc"
    } = req.query;

    const skip = (page - 1) * limit;
    const regex = new RegExp(search, "i");

    const query = {
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
        { location: { $regex: regex } },
        { status: { $regex: regex } }
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

// ✅ POST /api/leads/upload - Upload CSV and assign leads with logic
export const uploadCSV = async (req, res) => {
  const filePath = req.file.path;
  const leads = [];
  const requiredFields = ["name", "email", "phone", "language", "location"];
  let invalidRows = 0;

  try {
    // 1️⃣ Read all rows from CSV
    const allRows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => allRows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    // 2️⃣ Filter valid rows
    const validRows = allRows.filter((row) =>
      requiredFields.every((f) => row[f] && row[f].trim() !== "")
    );
    const newLeadCount = validRows.length;

    // 3️⃣ Prepare distribution based on existing leads and employees
    const { maxPerEmployee } = await prepareLeadDistribution(newLeadCount);

    // 4️⃣ Process each row (valid and assignable)
    for (const row of allRows) {
      const isValid = requiredFields.every(
        (f) => row[f] && row[f].trim() !== ""
      );

      if (!isValid) {
        invalidRows++;
        continue;
      }

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

    // 5️⃣ Save all valid leads to DB
    await Lead.insertMany(leads);

    // 6️⃣ Delete temp file
    fs.unlinkSync(filePath);

    // ✅ Done
    res.status(200).json({
      message: "Leads uploaded successfully",
      uploaded: leads.length,
      invalidRows
    });
  } catch (error) {
    console.error("Error uploading leads:", error);
    res.status(500).json({ error: "Error uploading leads" });
  }
};

// ✅ POST /api/leads - Add a single lead manually
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

    res.status(201).json({
      message: "Lead added successfully",
      lead: newLead
    });
  } catch (error) {
    console.error("Error adding manual lead:", error);
    res.status(500).json({ error: "Failed to add lead" });
  }
};
