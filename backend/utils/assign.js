// backend/utils/assign.js
import Employee from "../models/employee.js";
import Lead from "../models/lead.js";

// Global index tracker for each group
const groupIndexes = {
  group1: 0,
  group2: 0,
  group3: 0
};

export const assignEmployeeByConditions = async (lead) => {
  const employees = await Employee.find(); // all employees
  const leadCount = await Lead.aggregate([
    {
      $group: {
        _id: "$assignedEmployee",
        count: { $sum: 1 }
      }
    }
  ]);

  const leadMap = {};
  leadCount.forEach((item) => {
    if (item._id) {
      leadMap[item._id.toString()] = item.count;
    }
  });

  // Group 1: Exact match
  const group1 = employees.filter(
    (emp) => emp.language === lead.language && emp.location === lead.location
  );

  // Group 2: Partial match
  const group2 = employees.filter(
    (emp) =>
      (emp.language === lead.language || emp.location === lead.location) &&
      !(emp.language === lead.language && emp.location === lead.location)
  );

  // Group 3: No match
  const group3 = employees.filter(
    (emp) => emp.language !== lead.language && emp.location !== lead.location
  );

  // Sorting each group by current lead count
  const sortByLeadCount = (group) =>
    group.sort((a, b) => {
      const aCount = leadMap[a._id.toString()] || 0;
      const bCount = leadMap[b._id.toString()] || 0;
      return aCount - bCount;
    });

  const sortedGroup1 = sortByLeadCount(group1);
  const sortedGroup2 = sortByLeadCount(group2);
  const sortedGroup3 = sortByLeadCount(group3);

  // Round robin index tracking + assign
  if (sortedGroup1.length > 0) {
    const idx = groupIndexes.group1 % sortedGroup1.length;
    groupIndexes.group1++;
    return sortedGroup1[idx]._id;
  } else if (sortedGroup2.length > 0) {
    const idx = groupIndexes.group2 % sortedGroup2.length;
    groupIndexes.group2++;
    return sortedGroup2[idx]._id;
  } else if (sortedGroup3.length > 0) {
    const idx = groupIndexes.group3 % sortedGroup3.length;
    groupIndexes.group3++;
    return sortedGroup3[idx]._id;
  }

  return null;
};
