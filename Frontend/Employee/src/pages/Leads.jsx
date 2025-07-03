// src/pages/Leads.jsx
import React from "react";
import PageLayout from "../components/Layout";
import styles from "../styles/Leads.module.css";

const Leads = () => {
  return (
    <PageLayout>
      <div className={styles.placeholder}>
        {/* Optional: You can add lead list or empty state message here */}
        <p>solve the</p>
      </div>
    </PageLayout>
  );
};

export default Leads