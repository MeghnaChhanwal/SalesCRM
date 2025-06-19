// src/pages/Employee.jsx
import React, { useEffect, useState } from "react";
import MainLayout from "../components/Layout";
import styles from "../styles/Employees.module.css";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [currentIndex, setCurrentIndex] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    language: "",
  });

  // 🔁 Fetch employees from backend
  useEffect(() => {
    axios.get(`${API_BASE}/api/employees`)
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleAddClick = () => {
    setFormMode("add");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      location: "",
      language: "",
    });
    setShowForm(true);
  };

  const handleEditClick = (index) => {
    const emp = employees[index];
    setFormMode("edit");
    setCurrentIndex(index);
    setFormData({ ...emp });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    axios.delete(`${API_BASE}/api/employees/${id}`)
      .then(() => {
        setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      });
  };

  const handleClose = () => setShowForm(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (formMode === "add") {
      const newEmp = {
        ...formData,
        employeeId: `#EMP${Math.floor(100000 + Math.random() * 900000)}`,
        status: "Active",
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
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Employee ID</th>
            <th>Status</th>
            <th>Assigned Leads</th>
            <th>Closed Leads</th>
            <th>⋮</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, idx) => (
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

      {/* Modal Form */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalForm} onSubmit={handleSave}>
            <h3>{formMode === "edit" ? "Edit Employee" : "Add New Employee"}</h3>

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
