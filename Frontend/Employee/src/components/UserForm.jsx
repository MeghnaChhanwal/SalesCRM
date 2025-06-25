// src/components/UserForm.jsx
import React from "react";
import styles from "../styles/UserForm.module.css";

const UserForm = ({ fields, formData, onChange, onSubmit, error, buttonLabel }) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      {fields.map((field) => (
        <input
          key={field.name}
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          value={formData[field.name]}
          onChange={onChange}
          required={field.required}
          className={styles.input}
        />
      ))}
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button}>
        {buttonLabel}
      </button>
    </form>
  );
};

export default UserForm;
