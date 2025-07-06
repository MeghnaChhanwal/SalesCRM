import Employee from "../models/employee.js";
import Lead from "../models/lead.js";
import Timing from "../models/timing.js";
import { buildQueryOptions } from "../utils/query.js";
import { todayIST } from "../utils/time.js";

// 🔹 GET: Paginated employee list with status, lead counts
export const getEmployees = async (req, res) => {
  try {
    const { search, sortBy, order, page, limit, skip } = buildQueryOptions(req);

    const allowedSortFields = ["firstName", "lastName", "email", "employeeId", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const query = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: search,
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
      .sort({ [sortField]: order });

    const today = todayIST();

    const enrichedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const assignedLeads = await Lead.countDocuments({ assignedEmployee: emp._id });
        const closedLeads = await Lead.countDocuments({
          assignedEmployee: emp._id,
          status: "Closed",
        });

        const timing = await Timing.findOne({ employee: emp._id, date: today });
        let status = "Inactive";
        if (timing && timing.checkIn && !timing.checkOut && timing.status !== "Inactive") {
          status = "Active";
        }

        return {
          ...emp.toObject(),
          assignedLeads,
          closedLeads,
          status,
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

// 🔹 GET: All employees (for dropdowns etc.)
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    const today = todayIST();

    const enriched = await Promise.all(
      employees.map(async (emp) => {
        const assignedLeads = await Lead.countDocuments({ assignedEmployee: emp._id });
        const closedLeads = await Lead.countDocuments({
          assignedEmployee: emp._id,
          status: "Closed",
        });

        const timing = await Timing.findOne({ employee: emp._id, date: today });
        let status = "Inactive";
        if (timing && timing.checkIn && !timing.checkOut && timing.status !== "Inactive") {
          status = "Active";
        }

        return {
          ...emp.toObject(),
          assignedLeads,
          closedLeads,
          status,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (err) {
    console.error("Error fetching all employees:", err);
    res.status(500).json({ error: "Failed to fetch all employees" });
  }
};

// 🔹 POST: Create new employee
export const createEmployee = async (req, res) => {
  try {
    const newEmp = new Employee(req.body);
    await newEmp.save();
    res.status(201).json(newEmp);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email or Employee ID already exists" });
    }
    console.error("Create employee error:", err);
    res.status(500).json({ error: "Failed to create employee" });
  }
};

// 🔹 PUT: Update employee
export const updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ error: "Employee not found" });

    res.status(200).json(updated);
  } catch (err) {
    console.error("Update employee error:", err);
    res.status(500).json({ error: "Failed to update employee" });
  }
};

// 🔹 DELETE: Remove employee
export const deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Employee not found" });

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

// 🔹 PATCH: Auto update statuses in DB (if needed by CRON or admin trigger)
export const autoUpdateEmployeeStatuses = async (req, res) => {
  const today = todayIST();

  try {
    const allEmployees = await Employee.find();

    for (const emp of allEmployees) {
      const timing = await Timing.findOne({ employee: emp._id, date: today });

      if (!timing || timing.status === "Inactive" || timing.checkOut) {
        if (emp.status !== "Inactive") {
          emp.status = "Inactive";
          await emp.save();
        }
      } else if (timing.checkIn && emp.status !== "Active") {
        emp.status = "Active";
        await emp.save();
      }
    }

    res.status(200).json({ message: "Employee statuses updated successfully" });
  } catch (error) {
    console.error("Auto status update error:", error);
    res.status(500).json({ error: "Failed to update employee statuses" });
  }
};
