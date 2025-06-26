// src/pages/employeePage/Employee.jsx

import React, { useEffect, useState } from "react";
import MainLayout from "../components/Layout";
import styles from "../styles/Employees.module.css";
import axios from "axios";
import Pagination from "../components/Pagination";
import { sortData } from "../utils/sort"; // sorting import

const API_BASE = import.meta.env.VITE_API_BASE;

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 8;

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

  const indexOfLast = currentPage * employeesPerPage;
  const indexOfFirst = indexOfLast - employeesPerPage;

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/employees`)
      .then((res) => setEmployees(res.data))
      .catch(() => setErrorMessage("Failed to fetch employees."));
  }, []);

  // sorting handler
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = sortData(employees, sortConfig);
  const currentEmployees = sortedEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(employees.length / employeesPerPage);

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
    const emp = currentEmployees[index];
    const globalIndex = indexOfFirst + index;
    setFormMode("edit");
    setCurrentIndex(globalIndex);
    setFormData({ ...emp });
    setErrorMessage("");
    setShowForm(true);
  };

  const handleDelete = (id) => {
    axios
      .delete(`${API_BASE}/api/employees/${id}`)
      .then(() => {
        setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      })
      .catch(() => setErrorMessage("Failed to delete employee."));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "email") setErrorMessage(""); // clear error when email changes
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
        const res = await axios.post(`${API_BASE}/api/employees`, newEmp);
        setEmployees([...employees, res.data]);
      } else {
        const res = await axios.put(`${API_BASE}/api/employees/${formData._id}`, formData);
        const updatedList = [...employees];
        updatedList[currentIndex] = res.data;
        setEmployees(updatedList);
      }

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
      onSearch={(val) => console.log("Search:", val)}
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
              <th onClick={() => handleSort("firstName")} style={{ cursor: "pointer" }}>Name</th>
              <th onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>Email</th>
              <th onClick={() => handleSort("employeeId")} style={{ cursor: "pointer" }}>Employee ID</th>
              <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>Status</th>
              <th onClick={() => handleSort("assignedLeads")} style={{ cursor: "pointer" }}>Assigned Leads</th>
              <th onClick={() => handleSort("closedLeads")} style={{ cursor: "pointer" }}>Closed Leads</th>
              <th>⋮</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((emp, idx) => (
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
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {showForm && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalForm} onSubmit={handleSave}>
            <h3>{formMode === "edit" ? "Edit Employee" : "Add New Employee"}</h3>

            {errorMessage && errorMessage.includes("email") && (
              <p className={styles.error}>{errorMessage}</p>
            )}

            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
            />
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />

            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={formMode === "edit"}
              required
            >
              <option value="">Select Location</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Delhi">Delhi</option>
              <option value="Chennai">Chennai</option>
            </select>

            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              disabled={formMode === "edit"}
              required
            >
              <option value="">Select Language</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
              <option value="Marathi">Marathi</option>
              <option value="Kannada">Kannada</option>
              <option value="Tamil">Tamil</option>
            </select>

            <div className={styles.formActions}>
              <button type="submit">{formMode === "edit" ? "Update" : "Save"}</button>
              <button type="button" onClick={handleClose}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </MainLayout>
  );
};

export default Employee;
