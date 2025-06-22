// backend/controllers/leadController.js
import fs from "fs";
import csv from "csv-parser";
import Lead from "../models/lead.js";
import { assignEmployeeByConditions } from "../utils/assign.js";

// Get all leads
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .sort({ receivedDate: -1 })
      .populate("assignedEmployee");
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

// Upload CSV
export const uploadCSV = async (req, res) => {
  const filePath = req.file.path;
  const leads = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", async (row) => {
      if (!row.email && !row.phone) return;

      const lead = {
        name: row.name,
        email: row.email || null,
        phone: row.phone || null,
        receivedDate: row.receivedDate ? new Date(row.receivedDate) : new Date(),
        status: row.status || "Open",
        type: row.type || "Warm",
        language: row.language,
        location: row.location,
        assignedEmployee: await assignEmployeeByConditions(row)
      };

      leads.push(lead);
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
