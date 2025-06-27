// controllers/leadController.js
import fs from "fs";
import csv from "csv-parser";
import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import { assignEmployeeByConditions } from "../utils/assign.js";

// ✅ GET all leads
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .sort({ receivedDate: -1 })
      .populate("assignedEmployee");
    res.status(200).json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

// ✅ UPLOAD leads from CSV
export const uploadCSV = async (req, res) => {
  const filePath = req.file.path;
  const leads = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", async (row) => {
      if (!row.email && !row.phone) return;

      const assignedEmployee = await assignEmployeeByConditions(row);

      if (assignedEmployee) {
        await Employee.findByIdAndUpdate(assignedEmployee, {
          $inc: { assignedLeads: 1 },
        });
      }

      leads.push({
        name: row.name,
        email: row.email || null,
        phone: row.phone || null,
        receivedDate: row.receivedDate ? new Date(row.receivedDate) : new Date(),
        status: row.status || "Open",
        type: row.type || "Warm",
        language: row.language,
        location: row.location,
        assignedEmployee,
      });
    })
    .on("end", async () => {
      try {
        await Lead.insertMany(leads);
        fs.unlinkSync(filePath);
        res.status(200).json({ message: "Leads uploaded successfully", count: leads.length });
      } catch (error) {
        res.status(500).json({ error: "Error inserting leads" });
      }
    });
};
