// ✅ controllers/leadController.js
import fs from "fs";
import csv from "csv-parser";
import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import { assignEmployeeByConditions } from "../utils/assign.js";

export const uploadCSV = async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: "No file uploaded" });

  const leads = [];
  const requiredFields = ["name", "email", "phone", "language", "location"];
  let invalidRows = 0;
  let duplicateRows = 0;
  let totalRows = 0;

  try {
    const existingLeads = await Lead.find({}, "email name");
    const existingSet = new Set(
      existingLeads.map((lead) => `${lead.name}-${lead.email}`)
    );

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (row) => {
        totalRows++;

        // Validate required fields
        const isValid = requiredFields.every(
          (field) => row[field] && row[field].trim() !== ""
        );
        if (!isValid) return invalidRows++;

        const key = `${row.name}-${row.email}`;
        if (existingSet.has(key)) return duplicateRows++;

        const assignedEmployee = await assignEmployeeByConditions(row);
        if (assignedEmployee) {
          await Employee.findByIdAndUpdate(assignedEmployee, {
            $inc: { assignedLeads: 1 },
          });
        }

        leads.push({
          name: row.name.trim(),
          email: row.email.trim(),
          phone: row.phone.trim(),
          receivedDate: row.receivedDate
            ? new Date(row.receivedDate)
            : new Date(),
          status: row.status || "Open",
          type: row.type || "Warm",
          language: row.language.trim(),
          location: row.location.trim(),
          assignedEmployee,
        });
      })
      .on("end", async () => {
        try {
          await Lead.insertMany(leads);
          fs.unlinkSync(filePath);

          res.status(200).json({
            message: "✅ Lead CSV processed",
            total: totalRows,
            uploaded: leads.length,
            duplicates: duplicateRows,
            invalid: invalidRows,
          });
        } catch (error) {
          console.error("Insert error:", error);
          res.status(500).json({ error: "Failed to save valid leads" });
        }
      });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
