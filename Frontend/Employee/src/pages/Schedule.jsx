// src/pages/Schedule.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import styles from "../styles/Schedule.module.css";
import API from "../utils/axios";

const Schedule = () => {
  const [scheduledLeads, setScheduledLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledLeads();
  }, []);

  const fetchScheduledLeads = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/schedule");
      setScheduledLeads(res.data.scheduled || []);
    } catch (err) {
      console.error("Error fetching scheduled leads:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2>📅 Scheduled Calls</h2>
        {loading ? (
          <p>Loading...</p>
        ) : scheduledLeads.length === 0 ? (
          <p>No scheduled calls found.</p>
        ) : (
          <ul className={styles.scheduleList}>
            {scheduledLeads.map((lead) => (
              <li key={lead._id} className={styles.scheduleItem}>
                <strong>{lead.name}</strong> — Scheduled at{" "}
                {new Date(lead.scheduledDate).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Schedule;
