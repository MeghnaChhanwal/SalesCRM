import React, { useEffect, useState } from "react";
import MainLayout from "../components/Layout";
import styles from "../styles/Employees.module.css";
import API from "../utils/axios";
import Pagination from "../components/Pagination";
import EmployeeForm from "../components/EmployeeForm";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 8;
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    language: "",
  });
  const [currentIndex, setCurrentIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch employees
  useEffect(() => {
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
      } catch (err) {
        console.error("Error fetching employees:", err);
        setErrorMessage("Failed to fetch employees.");
        setEmployees([]);
        setTotalPages(1);
      }
    };

    fetchEmployees();
  }, [searchTerm, currentPage, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddClick = () => {
    setFormMode("add");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      location: "",
      language: "",
    });
    setErrorMessage("");
    setShowForm(true);
  };

  const handleEditClick = (index) => {
    const emp = employees[index];
    setFormMode("edit");
    setCurrentIndex(index);
    setFormData({ ...emp });
    setErrorMessage("");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/employees/${id}`);
      const res = await API.get("/api/employees", {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: employeesPerPage,
          sortBy: sortConfig.key,
          order: sortConfig.direction,
        },
      });
      setEmployees(res.data.employees || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setErrorMessage("Failed to delete employee.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "email") setErrorMessage("");
  };

  const handleClose = () => {
    setShowForm(false);
    setErrorMessage("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const isDuplicateEmail = employees.some(
      (emp) =>
        emp.email.toLowerCase() === formData.email.toLowerCase() &&
        (formMode === "add" || emp._id !== formData._id)
    );

    if (isDuplicateEmail) {
      setErrorMessage("❌ This email ID is already registered.");
      return;
    }

    try {
      if (formMode === "add") {
        const newEmp = {
          ...formData,
          employeeId: `#EMP${Math.floor(100000 + Math.random() * 900000)}`,
          status: "Inactive",
          assignedLeads: 0,
          closedLeads: 0,
        };
        await API.post("/api/employees", newEmp);
      } else {
        await API.put(`/api/employees/${formData._id}`, formData);
      }

      const res = await API.get("/api/employees", {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: employeesPerPage,
          sortBy: sortConfig.key,
          order: sortConfig.direction,
        },
      });
      setEmployees(res.data.employees || []);
      setTotalPages(res.data.totalPages || 1);
      setShowForm(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        location: "",
        language: "",
      });
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong";
      setErrorMessage(msg);
    }
  };

  return (
    <MainLayout
      onSearch={setSearchTerm}
      rightElement={
        <button className={styles.addBtn} onClick={handleAddClick}>
          ➕ Add Employee
        </button>
      }
    >
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort("firstName")}>Name</th>
              <th onClick={() => handleSort("email")}>Email</th>
              <th onClick={() => handleSort("employeeId")}>Employee ID</th>
              <th onClick={() => handleSort("status")}>Status</th>
              <th onClick={() => handleSort("assignedLeads")}>Assigned</th>
              <th onClick={() => handleSort("closedLeads")}>Closed</th>
              <th>⋮</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(employees) && employees.length > 0 ? (
              employees.map((emp, idx) => (
                <tr key={emp._id}>
                  <td>{emp.firstName} {emp.lastName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.employeeId}</td>
                  <td>{emp.status}</td>
                  <td>{emp.assignedLeads}</td>
                  <td>{emp.closedLeads}</td>
                  <td>
                    <div className={styles.dropdown}>
                      <button className={styles.menuBtn}>⋮</button>
                      <div className={styles.menuContent}>
                        <button onClick={() => handleEditClick(idx)}>Edit</button>
                        <button onClick={() => handleDelete(emp._id)}>Delete</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
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
          onClose={handleClose}
        />
      )}
    </MainLayout>
  );
};

export default Employee;
