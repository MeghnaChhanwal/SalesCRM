import fs from "fs";
import csv from "csv-parser";
import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import { assignEmployeeByConditions } from "../utils/assign.js";

// ✅ Get Leads with search, sort, pagination
export const getLeads = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 8, sortBy = "receivedDate", order = "desc" } = req.query;
    const skip = (page - 1) * limit;
    const regex = new RegExp(search, "i");

    const query = {
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
        { status: { $regex: regex } },
        { location: { $regex: regex } },
      ],
    };

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("assignedEmployee", "firstName lastName"); // No email

    res.status(200).json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalLeads: total,
    });
  } catch (err) {
    console.error("Failed to fetch leads:", err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

// ✅ Upload CSV with validation, assignment & skip invalid
export const uploadCSV = async (req, res) => {
  const filePath = req.file.path;
  const leads = [];
  const requiredFields = ["name", "email", "phone", "language", "location"];
  let invalidRows = 0;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", async (row) => {
      const isValid = requiredFields.every(field => row[field] && row[field].trim() !== "");
      if (!isValid) return invalidRows++;

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
        res.status(200).json({
          message: "Leads uploaded successfully",
          uploaded: leads.length,
          invalidRows,
        });
      } catch (error) {
        console.error("Error inserting leads:", error);
        res.status(500).json({ error: "Error inserting leads" });
      }
    });
};
