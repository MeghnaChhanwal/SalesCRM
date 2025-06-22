// backend/utils/assign.js
import Employee from "../models/employee.js";
import Lead from "../models/lead.js";

export const assignEmployeeByConditions = async (lead) => {
  const employees = await Employee.find();

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

  let eligible = employees.filter(
    emp => emp.language === lead.language && emp.location === lead.location
  );

  if (eligible.length === 0) {
    eligible = employees.filter(
      emp => emp.language === lead.language || emp.location === lead.location
    );
  }

  if (eligible.length === 0) {
    eligible = [...employees];
  }

  eligible.sort((a, b) => {
    const aCount = leadMap[a._id.toString()] || 0;
    const bCount = leadMap[b._id.toString()] || 0;
    return aCount - bCount;
  });

  return eligible[0]?._id || null;
};
