import fs from "fs";
import csv from "csv-parser";
import { Parser as Json2csvParser } from "json2csv";
import Lead from "../models/lead.js";

export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ receivedDate: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

export const uploadCSV = async (req, res) => {
  const filePath = req.file.path;
  const leads = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      if (!row.email && !row.phone) return;

      leads.push({
        name: row.name,
        email: row.email || null,
        phone: row.phone || null,
        receivedDate: row.receivedDate ? new Date(row.receivedDate) : new Date(),
        status: row.status || "Open",
        type: row.type || "Warm",
        language: row.language,
        location: row.location,
        assignedEmployee: row.assignedEmployee || null
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

export const exportCSV = async (req, res) => {
  try {
    const leads = await Lead.find().lean();
    const fields = ['name', 'email', 'phone', 'receivedDate', 'status', 'type', 'language', 'location', 'assignedEmployee'];
    const parser = new Json2csvParser({ fields });
    const csv = parser.parse(leads);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.status(200).end(csv);
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
};
