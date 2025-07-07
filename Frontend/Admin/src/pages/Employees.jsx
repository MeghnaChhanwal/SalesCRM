import React, { useEffect, useState } from "react";
import MainLayout from "../components/Layout";
import Pagination from "../components/Pagination";
import API from "../utils/axios";
import EmployeeForm from "../components/EmployeeForm";
import Profile from "../components/ProfileLogo";
import styles from "../styles/Employees.module.css";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", location: "", language: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  // Fetch employees when filters change
  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, currentPage, sortConfig]);

  // Auto-update employee statuses once on mount, then fetch employees again
  useEffect(() => {
    const updateEmployeeStatuses = async () => {
      try {
        await API.patch("/api/employees/auto/update-status");
        fetchEmployees();
      } catch (err) {
        console.error("Failed to auto-update employee statuses", err);
      }
    };

    updateEmployeeStatuses();
  }, []);

  // Close dropdown menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.dropdown}`)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchEmployees = async () => {
    try {
      const params = {
        search: searchTerm,
        page: currentPage,
        limit: employeesPerPage,
        sortBy: sortConfig.key,
        order: sortConfig.direction,
      };
      const res = await API.get("/api/employees", { params });
      setEmployees(res.data.employees || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setErrorMessage("Failed to fetch employees.");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddClick = () => {
    setFormMode("add");
    setFormData({ firstName: "", lastName: "", email: "", location: "", language: "" });
    setErrorMessage("");
    setShowForm(true);
  };

  const handleEditClick = (employee) => {
    setFormMode("edit");
    setFormData({ ...employee });
    setShowForm(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;
    try {
      await API.delete(`/api/employees/${id}`);
      fetchEmployees();
      setOpenMenuId(null);
    } catch {
      setErrorMessage("Failed to delete employee.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "email") setErrorMessage("");
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage("First and last name are required.");
      return false;
    }
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      setErrorMessage("Only Gmail addresses are allowed.");
      return false;
    }
    if (!formData.location || !formData.language) {
      setErrorMessage("Location and language are required.");
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isDuplicate = employees.some(
      (emp) =>
        emp.email.toLowerCase() === formData.email.toLowerCase() &&
        (formMode === "add" || emp._id !== formData._id)
    );

    if (isDuplicate) {
      setErrorMessage("This email ID is already registered.");
      return;
    }

    try {
      if (formMode === "add") {
        await API.post("/api/employees", {
          ...formData,
          employeeId: `#EMP${Math.floor(100000 + Math.random() * 900000)}`,
          status: "Inactive",
          assignedLeads: 0,
          closedLeads: 0,
        });
      } else {
        await API.put(`/api/employees/${formData._id}`, formData);
      }
      fetchEmployees();
      setShowForm(false);
      setFormData({ firstName: "", lastName: "", email: "", location: "", language: "" });
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong.";
      setErrorMessage(msg);
    }
  };

  return (
    <MainLayout
      onSearch={setSearchTerm}
      rightElement={
        <button className={styles.addBtn} onClick={handleAddClick}>
          Add Employee
        </button>
      }
    >
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort("firstName")}>Name</th>
              <th onClick={() => handleSort("employeeId")}>Employee ID</th>
              <th onClick={() => handleSort("status")}>Status</th>
              <th onClick={() => handleSort("assignedLeads")}>Assigned</th>
              <th onClick={() => handleSort("closedLeads")}>Closed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <Profile
                      firstName={emp.firstName}
                      lastName={emp.lastName}
                      email={emp.email}
                      showEmail={true}
                    />
                  </td>
                  <td>
                    <span className={styles.empIdBox}>{emp.employeeId}</span>
                  </td>
                  <td>
                    <span
                      className={
                        emp.status === "Active"
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td>{emp.assignedLeads}</td>
                  <td>{emp.closedLeads}</td>
                  <td className={styles.dropdown}>
                    <button
                      className={styles.menuBtn}
                      onClick={() =>
                        setOpenMenuId(openMenuId === emp._id ? null : emp._id)
                      }
                    >
                      ⋮
                    </button>
                    {openMenuId === emp._id && (
                      <div className={styles.menuContent}>
                        <button onClick={() => handleEditClick(emp)}>
                          <img
                            src="/edit.png"
                            alt="Edit"
                            height={14}
                            style={{ marginRight: 6 }}
                          />
                          Edit
                        </button>
                        <button onClick={() => handleDelete(emp._id)}>
                          <img
                            src="/delete.png"
                            alt="Delete"
                            height={14}
                            style={{ marginRight: 6 }}
                          />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {showForm && (
        <EmployeeForm
          formMode={formMode}
          formData={formData}
          errorMessage={errorMessage}
          onChange={handleChange}
          onSubmit={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </MainLayout>
  );
};

export default Employee;
