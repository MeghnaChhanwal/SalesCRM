import React, { useState, useEffect } from "react";
import styles from "../styles/Profile.module.css";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import PageLayout from "../components/Layout";

const API_BASE = import.meta.env.VITE_API_BASE;

const Profile = () => {
  const { employee, setEmployee } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (employee) {
      setForm({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        password: employee.password || "",
        confirmPassword: employee.password || "",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.put(`${API_BASE}/api/employees/${employee._id}`, form);
      setEmployee(res.data);
      localStorage.setItem("employee", JSON.stringify(res.data));
      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    }
  };

  return (
    <PageLayout>
      <div className={styles.card}>
        <label>First name</label>
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="Enter first name"
        />

        <label>Last name</label>
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Enter last name"
        />

        <label>Email</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter email"
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter new password"
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm new password"
        />

        <button className={styles.saveButton} onClick={handleSubmit}>
          Save
        </button>
      </div>
    </PageLayout>
  );
};

export default Profile;
