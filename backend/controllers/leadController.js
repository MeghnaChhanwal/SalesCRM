// controllers/leadController.js
import fs from "fs";
import csv from "csv-parser";
import Lead from "../models/lead.js";
import Employee from "../models/employee.js";
import { assignEmployeeByConditions } from "../utils/assign.js";

// ✅ GET leads with search, sort, pagination
export const getLeads = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const sortBy = req.query.sortBy || "receivedDate";
    const order = req.query.order === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;
    const regex = new RegExp(search, "i");

    // Search query on multiple fields
    const query = {
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
        { status: { $regex: regex } },
        { type: { $regex: regex } },
        { language: { $regex: regex } },
        { location: { $regex: regex } },
      ],
    };

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
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

// ✅ UPLOAD leads from CSV with assignment
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
        console.error("Error inserting leads:", error);
        res.status(500).json({ error: "Error inserting leads" });
      }
    });
};
