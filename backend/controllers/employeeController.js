import Employee from "../models/employee.js";
import Lead from "../models/lead.js";
import { buildQueryOptions } from "../utils/query.js";
import {
  assignUnassignedLeads,
  redistributeLeadsOfDeletedEmployee,
} from "../utils/assign.js";

// 🔹 Utility: Add lead stats to each employee
const addLeadStatsToEmployees = async (employees) => {
  const enriched = await Promise.all(
    employees.map(async (emp) => {
      const [assignedLeads, closedLeads] = await Promise.all([
        Lead.countDocuments({ assignedEmployee: emp._id }),
        Lead.countDocuments({ assignedEmployee: emp._id, status: "Closed" }),
      ]);
      return {
        ...emp.toObject(),
        assignedLeads,
        closedLeads,
      };
    })
  );
  return enriched;
};

// 🔹 GET /api/employees - Paginated, searchable, sortable
export const getEmployees = async (req, res) => {
  try {
    const { search, sortBy, order, page, limit, skip, regex } = buildQueryOptions(req);
    const allowedSortFields = ["firstName", "lastName", "email", "employeeId", "createdAt"];
    const customFields = ["assignedLeads", "closedLeads"];
    const isSimpleSort = allowedSortFields.includes(sortBy);

    const query = {
      $or: [
        { firstName: { $regex: regex, $options: "i" } },
        { lastName: { $regex: regex, $options: "i" } },
        { email: { $regex: regex, $options: "i" } },
        { employeeId: { $regex: regex, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: regex,
              options: "i",
            },
          },
        },
      ],
    };

    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .skip(skip)
      .limit(limit)
      .sort(isSimpleSort ? { [sortBy]: order } : { createdAt: -1 });

    let enrichedEmployees = await addLeadStatsToEmployees(employees);

    if (customFields.includes(sortBy)) {
      enrichedEmployees.sort((a, b) =>
        order === 1 ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
      );
    }

    res.status(200).json({
      employees: enrichedEmployees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalEmployees: total,
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees list" });
  }
};

// 🔹 GET /api/employees/all - Non-paginated (for dropdowns, analytics)
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    const enriched = await addLeadStatsToEmployees(employees);
    res.status(200).json(enriched);
  } catch (err) {
    console.error("Error fetching all employees:", err);
    res.status(500).json({ error: "Failed to fetch all employees" });
  }
};

// 🔹 POST /api/employees - Add new employee and assign unassigned leads
export const createEmployee = async (req, res) => {
  try {
    const newEmp = new Employee(req.body);
    await newEmp.save();

    await assignUnassignedLeads(); // Assign unassigned leads to new employee

    res.status(201).json(newEmp);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email or Employee ID already exists" });
    }

    console.error("Create employee error:", err);
    res.status(500).json({ error: "Failed to create employee" });
  }
};

// 🔹 PUT /api/employees/:id - Update employee data
export const updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }

    console.error("Update employee error:", err);
    res.status(500).json({ error: "Failed to update employee" });
  }
};

// 🔹 DELETE /api/employees/:id - Delete and reassign open leads
export const deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Employee not found" });
    }

    await redistributeLeadsOfDeletedEmployee(req.params.id);

    res.status(200).json({ message: "Employee deleted and open leads reassigned" });
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};
