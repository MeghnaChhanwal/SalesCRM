import Employee from "../models/employee.js";
import Lead from "../models/lead.js";
import { buildQueryOptions } from "../utils/query.js";

// 🔹 GET /api/employees - Paginated, searchable, sortable list with dynamic lead counts
export const getEmployees = async (req, res) => {
  try {
    const { search, sortBy, order, page, limit, skip, regex } = buildQueryOptions(req);

    const allowedSortFields = ["firstName", "lastName", "email", "employeeId", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const query = {
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } },
        { employeeId: { $regex: regex } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: regex,
            },
          },
        },
      ],
    };

    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sortField]: order });

    const enrichedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const assignedLeads = await Lead.countDocuments({ assignedEmployee: emp._id });
        const closedLeads = await Lead.countDocuments({
          assignedEmployee: emp._id,
          status: "Closed",
        });

        return {
          ...emp.toObject(),
          assignedLeads,
          closedLeads,
        };
      })
    );

    res.status(200).json({
      employees: enrichedEmployees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalEmployees: total,
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// 🔹 GET /api/employees/all - All employees for dashboard (no pagination)
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      employees.map(async (emp) => {
        const assignedLeads = await Lead.countDocuments({ assignedEmployee: emp._id });
        const closedLeads = await Lead.countDocuments({
          assignedEmployee: emp._id,
          status: "Closed",
        });

        return {
          ...emp.toObject(),
          assignedLeads,
          closedLeads,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (err) {
    console.error("Error fetching all employees:", err);
    res.status(500).json({ error: "Failed to fetch all employees" });
  }
};

// 🔹 POST /api/employees - Create new employee
export const createEmployee = async (req, res) => {
  try {
    const newEmp = new Employee(req.body);
    await newEmp.save();
    res.status(201).json(newEmp);
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: err.message });
    } else if (err.code === 11000) {
      res.status(400).json({ error: "Email or Employee ID already exists" });
    } else {
      console.error("Create employee error:", err);
      res.status(500).json({ error: "Failed to create employee" });
    }
  }
};

// 🔹 PUT /api/employees/:id - Update employee
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
      res.status(400).json({ error: err.message });
    } else {
      console.error("Update employee error:", err);
      res.status(500).json({ error: "Failed to update employee" });
    }
  }
};

// 🔹 DELETE /api/employees/:id - Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};
