// Dashboard.jsx
import React from "react";
import MainLayout from "../components/Layout";
import styles from "../styles/Dashboard.module.css";

const Dashboard = () => {
  return (
    <MainLayout showSearch={false}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <h3>Total Leads</h3>
          <p>230</p>
        </div>
        <div className={styles.card}>
          <h3>Assigned Leads</h3>
          <p>150</p>
        </div>
        <div className={styles.card}>
          <h3>Closed Leads</h3>
          <p>85</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
