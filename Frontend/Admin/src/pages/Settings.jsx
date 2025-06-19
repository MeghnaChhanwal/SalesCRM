// src/pages/Settings.jsx
import React from "react";
import MainLayout from "../components/Layout";
import styles from "../styles/Settings.module.css";

const Settings = () => {
  return (
    <MainLayout showSearch={false}>
      <div className={styles.outerBox}>
        <h3 className={styles.title}>Edit Profile</h3>
        <hr className={styles.divider} />

        <form className={styles.form}>
          <label>First Name</label>
          <input type="text" placeholder="Sarthak" />

          <label>Last Name</label>
          <input type="text" placeholder="Pal" />

          <label>Email</label>
          <input type="email" placeholder="sarthakpal08@gmail.com" />

          <label>Password</label>
          <input type="password" placeholder="********" />

          <label>Confirm Password</label>
          <input type="password" placeholder="********" />

          <button className={styles.saveBtn}>Save</button>
        </form>
      </div>
    </MainLayout>
  );
};

export default Settings;
