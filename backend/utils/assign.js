import Employee from "../models/employee.js";
import Lead from "../models/lead.js";

// Temporary in-memory lead tracker for upload session
let tempLeadMap = {};

export const prepareLeadDistribution = async (newLeadCount) => {
  const employees = await Employee.find();

  // 🛑 If no employee exists
  if (employees.length === 0) {
    return {
      employees: [],
      maxPerEmployee: 0,
    };
  }

  const existingCounts = await Lead.aggregate([
    { $group: { _id: "$assignedEmployee", count: { $sum: 1 } } },
  ]);

  const totalExisting = existingCounts.reduce((sum, item) => sum + item.count, 0);
  const totalLeads = totalExisting + newLeadCount;
  const maxPerEmployee = Math.ceil(totalLeads / employees.length);

  const employeeMap = {};
  employees.forEach((emp) => {
    employeeMap[emp._id.toString()] = {
      employee: emp,
      assigned: 0,
    };
  });

  existingCounts.forEach((item) => {
    if (item._id && employeeMap[item._id.toString()]) {
      employeeMap[item._id.toString()].assigned = item.count;
    }
  });

  // Initialize temp map for current session
  tempLeadMap = {};
  Object.entries(employeeMap).forEach(([id, data]) => {
    tempLeadMap[id] = data.assigned;
  });

  return {
    employees,
    maxPerEmployee,
  };
};

export const assignEmployeeByConditions = async (lead, maxPerEmployee) => {
  const employees = await Employee.find();

  // 🛑 No employees case
  if (employees.length === 0) return null;

  const sortedEmployees = employees
    .filter((emp) => (tempLeadMap[emp._id.toString()] || 0) < maxPerEmployee)
    .sort((a, b) => {
      const aCount = tempLeadMap[a._id.toString()] || 0;
      const bCount = tempLeadMap[b._id.toString()] || 0;
      return aCount - bCount;
    });

  // 1️⃣ Exact match
  for (let emp of sortedEmployees) {
    if (emp.language === lead.language && emp.location === lead.location) {
      tempLeadMap[emp._id.toString()]++;
      return emp._id;
    }
  }

  // 2️⃣ Partial match
  for (let emp of sortedEmployees) {
    if (emp.language === lead.language || emp.location === lead.location) {
      tempLeadMap[emp._id.toString()]++;
      return emp._id;
    }
  }

  // 3️⃣ Fallback
  if (sortedEmployees.length > 0) {
    const chosen = sortedEmployees[0];
    tempLeadMap[chosen._id.toString()]++;
    return chosen._id;
  }

  return null; // still unassigned if over capacity
};
