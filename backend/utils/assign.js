import Employee from "../models/employee.js";
import Lead from "../models/lead.js";

let tempLeadMap = {};

export const prepareLeadDistribution = async (newLeadCount) => {
  const employees = await Employee.find();

  if (employees.length === 0) {
    return { employees: [], maxPerEmployee: 0 };
  }

  const existingCounts = await Lead.aggregate([
    { $group: { _id: "$assignedEmployee", count: { $sum: 1 } } },
  ]);

  const totalExisting = existingCounts.reduce((sum, item) => sum + item.count, 0);
  const totalLeads = totalExisting + newLeadCount;
  const maxPerEmployee = Math.ceil(totalLeads / employees.length);

  const employeeMap = {};
  employees.forEach((emp) => {
    employeeMap[emp._id.toString()] = { employee: emp, assigned: 0 };
  });

  existingCounts.forEach((item) => {
    if (item._id && employeeMap[item._id.toString()]) {
      employeeMap[item._id.toString()].assigned = item.count;
    }
  });

  tempLeadMap = {};
  Object.entries(employeeMap).forEach(([id, data]) => {
    tempLeadMap[id] = data.assigned;
  });

  return { employees, maxPerEmployee };
};

export const assignEmployeeByConditions = async (lead, maxPerEmployee) => {
  const employees = await Employee.find();

  if (employees.length === 0) return null;

  const sortedEmployees = employees
    .filter((emp) => (tempLeadMap[emp._id.toString()] || 0) < maxPerEmployee)
    .sort((a, b) => {
      const aCount = tempLeadMap[a._id.toString()] || 0;
      const bCount = tempLeadMap[b._id.toString()] || 0;
      return aCount - bCount;
    });

  for (let emp of sortedEmployees) {
    if (emp.language === lead.language && emp.location === lead.location) {
      tempLeadMap[emp._id.toString()]++;
      return emp._id;
    }
  }

  for (let emp of sortedEmployees) {
    if (emp.language === lead.language || emp.location === lead.location) {
      tempLeadMap[emp._id.toString()]++;
      return emp._id;
    }
  }

  if (sortedEmployees.length > 0) {
    const fallback = sortedEmployees[0];
    tempLeadMap[fallback._id.toString()]++;
    return fallback._id;
  }

  return null;
};
