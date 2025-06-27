// ✅ controllers/leadController.js
import fs from "fs";
import csv from "csv-parser";
import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import { assignEmployeeByConditions } from "../utils/assign.js";

export const getLeads = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 8, sortBy = "receivedDate", order = "desc" } = req.query;
    const skip = (page - 1) * limit;
    const regex = new RegExp(search, "i");

    const query = {
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } }
      ]
    };

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("assignedEmployee", "firstName lastName email");

    res.status(200).json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalLeads: total,
    });
  } catch (err) {
    console.error("Failed to fetch leads:", err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

export const uploadCSV = async (req, res) => {
  const filePath = req.file.path;
  const requiredFields = ["name", "email", "phone", "language", "location"];
  const leads = [];

  let invalidRows = 0;
  const seenEmails = new Set();
  const seenPhones = new Set();

  try {
    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    for (const row of rows) {
      const hasAllFields = requiredFields.every((field) => row[field] && row[field].trim() !== "");
      if (!hasAllFields) {
        invalidRows++;
        continue;
      }

      // Prevent duplicates (within same CSV)
      const email = row.email.trim().toLowerCase();
      const phone = row.phone.trim();

      if (seenEmails.has(email) || seenPhones.has(phone)) {
        invalidRows++;
        continue;
      }

      // Check if already exists in DB
      const exists = await Lead.findOne({
        $or: [{ email }, { phone }],
      });

      if (exists) {
        invalidRows++;
        continue;
      }

      seenEmails.add(email);
      seenPhones.add(phone);

      // Assign employee
      const assignedEmployee = await assignEmployeeByConditions(row);
      if (assignedEmployee) {
        await Employee.findByIdAndUpdate(assignedEmployee, { $inc: { assignedLeads: 1 } });
      }

      // Parse date or fallback to current
      const receivedDate = row.receivedDate ? new Date(row.receivedDate) : new Date();

      leads.push({
        name: row.name,
        email,
        phone,
        receivedDate,
        status: row.status || "Open",
        type: row.type || "Warm",
        language: row.language,
        location: row.location,
        assignedEmployee,
      });
    }

    await Lead.insertMany(leads);
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: "Leads uploaded successfully",
      uploaded: leads.length,
      skipped: invalidRows,
    });
  } catch (err) {
    console.error("Error uploading CSV:", err);
    res.status(500).json({ error: "Failed to upload CSV" });
  }
};
