// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Home = () => {
  const { employee, timing, logout } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchTiming = async () => {
      if (employee?.employeeId) {
        const res = await API.get(`/api/timing/${employee.employeeId}`);
        setHistory(res.data || []);
      }
    };
    fetchTiming();
  }, [employee]);

  if (!employee) return <Layout><p>Loading...</p></Layout>;

  const latest = history[0] || {};
  const lastBreak = latest.break?.[latest.break.length - 1];
  const breakStatus = lastBreak && !lastBreak.end ? "Break On" : "Break Off";

  return (
    <Layout>
      <div className={styles.header}>
        <h2 className={styles.title}>Welcome, {employee.name}</h2>
        <button className={styles.logout} onClick={logout}>Logout</button>
      </div>

      <div className={styles.card}>
        <p><strong>Status:</strong> {employee.status}</p>
        <p><strong>Check-in Time:</strong> {timing?.checkin || "—"}</p>
        <p><strong>Break Status:</strong> {breakStatus}</p>
      </div>

      <h3 className={styles.subtitle}>Break History (Last 7 Days)</h3>
      <div className={styles.history}>
        {history.map((entry, idx) => (
          <div key={idx} className={styles.day}>
            <p className={styles.date}>{entry.date}</p>
            {entry.break?.length ? (
              <ul className={styles.breakList}>
                {entry.break.map((b, i) => (
                  <li key={i} className={styles.breakItem}>
                    {b.start} - {b.end || "Ongoing"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noBreak}>No breaks</p>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Home;
