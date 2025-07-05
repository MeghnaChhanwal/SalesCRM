import Lead from "../models/lead.js";
import Employee from "../models/employee.js";

// 🔹 Prepare distribution based on existing lead counts
export const prepareLeadDistribution = async (newLeadCount = 0) => {
  const employees = await Employee.find();
  if (employees.length === 0) {
    return { employees: [], maxPerEmployee: 0, tempLeadMap: {} };
  }

  const existingCounts = await Lead.aggregate([
    { $match: { assignedEmployee: { $ne: null } } },
    { $group: { _id: "$assignedEmployee", count: { $sum: 1 } } },
  ]);

  const totalExisting = existingCounts.reduce((sum, item) => sum + item.count, 0);
  const totalLeads = totalExisting + newLeadCount;
  const maxPerEmployee = Math.ceil(totalLeads / employees.length);

  const tempLeadMap = {};
  for (const emp of employees) {
    tempLeadMap[emp._id.toString()] = 0;
  }

  for (const item of existingCounts) {
    if (item._id) {
      tempLeadMap[item._id.toString()] = item.count;
    }
  }

  return { employees, maxPerEmployee, tempLeadMap };
};

// 🔹 Assign employee to a lead based on matching criteria
export const assignEmployeeByConditions = async (lead, maxPerEmployee, employees, tempLeadMap) => {
  if (!employees || !employees.length) return null;

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

// 🔹 Reassign pending leads of deleted employee
export const redistributeLeadsOfDeletedEmployee = async (employeeId) => {
  const pendingLeads = await Lead.find({
    assignedEmployee: employeeId,
    status: { $ne: "Closed" },
  });

  if (pendingLeads.length === 0) return;

  const { employees, maxPerEmployee, tempLeadMap } = await prepareLeadDistribution(pendingLeads.length);

  for (const lead of pendingLeads) {
    const newEmployee = await assignEmployeeByConditions(lead, maxPerEmployee, employees, tempLeadMap);
    lead.assignedEmployee = newEmployee;
    await lead.save();
  }
};

// 🔹 Assign unassigned leads after adding new employee
export const assignUnassignedLeads = async () => {
  const unassignedLeads = await Lead.find({ assignedEmployee: null });
  if (unassignedLeads.length === 0) return;

  const { employees, maxPerEmployee, tempLeadMap } = await prepareLeadDistribution(unassignedLeads.length);

  for (const lead of unassignedLeads) {
    const newEmployee = await assignEmployeeByConditions(lead, maxPerEmployee, employees, tempLeadMap);
    lead.assignedEmployee = newEmployee;
    await lead.save();
  }
};
