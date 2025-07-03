// src/components/EmployeeForm.jsx

import React from "react";
import styles from "../styles/EmployeeForm.module.css";

const EmployeeForm = ({
  formMode,
  formData,
  errorMessage,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className={styles.modalOverlay}>
      <form className={styles.modalForm} onSubmit={onSubmit}>
        <h3>{formMode === "edit" ? "Edit Employee" : "Add New Employee"}</h3>

        {errorMessage && errorMessage.includes("email") && (
          <p className={styles.error}>{errorMessage}</p>
        )}

        <input
          name="firstName"
          value={formData.firstName}
          onChange={onChange}
          placeholder="First Name"
          required
        />
        <input
          name="lastName"
          value={formData.lastName}
          onChange={onChange}
          placeholder="Last Name"
          required
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="Email"
          required
        />

        <select
          name="location"
          value={formData.location}
          onChange={onChange}
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
          onChange={onChange}
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
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
