import React from "react";
import PageLayout from "../components/Layout";
import styles from "../styles/Schedule.module.css";

const Schedule = () => {
  return (
    <PageLayout>
      <div className={styles.card}>
        <h3>Upcoming Schedule</h3>
        <p>No scheduled events for today.</p>
      </div>
    </PageLayout>
  );
};

export default Schedule;