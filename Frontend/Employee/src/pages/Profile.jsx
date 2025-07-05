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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      return alert("Please fill in all required fields.");
    }

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      const { data } = await axios.put(
        `${API_BASE}/api/employees/${employee._id}`,
        form
      );
      setEmployee(data);
      localStorage.setItem("employee", JSON.stringify(data));
      alert("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Error updating profile.");
    }
  };

  return (
    <PageLayout>
      <div className={styles.card}>
        <label>First Name</label>
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="Enter first name"
        />

        <label>Last Name</label>
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Enter last name"
        />

        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter email"
        />

        <label>New Password</label>
        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter new password"
          />
          <span onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? "Show" : "hide"}
          </span>
        </div>

        <label>Confirm New Password</label>
        <div className={styles.passwordWrapper}>
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
          />
          <span onClick={() => setShowConfirm((prev) => !prev)}>
            {showConfirm ? "Show" : "hide"}
          </span>
        </div>

        <button className={styles.saveButton} onClick={handleSubmit}>
          Save
        </button>
      </div>
    </PageLayout>
  );
};

export default Profile;
