// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Home = () => {
  const { employee } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTiming = async () => {
      if (!employee?._id) return;

      try {
        const res = await API.get(`/api/timing/${employee._id}`);
        setHistory(res.data || []);
      } catch (err) {
        console.error("Error fetching timing:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTiming();

    // Optional: Auto-refresh every 60 seconds
    const interval = setInterval(fetchTiming, 60000);
    return () => clearInterval(interval);
  }, [employee]);

  if (!employee) return <Layout><p>Loading user...</p></Layout>;
  if (loading) return <Layout><p>Loading timings...</p></Layout>;

  const todayLog = history[0] || {};
  const breaks = todayLog.breaks || [];
  const lastBreak = breaks.length > 0 ? breaks[breaks.length - 1] : null;
  const breakStatus = lastBreak && !lastBreak.end ? "Break On" : "Break Off";

  return (
    <Layout>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Good Morning, {employee.firstName}</h2>
        <p className={styles.date}>{todayLog.date || new Date().toISOString().split("T")[0]}</p>
      </div>

      {/* Status Card */}
      <div className={styles.card}>
        <p><strong>Status:</strong> {todayLog.status || employee.status}</p>
        <p><strong>Check-in:</strong> {todayLog.checkIn || "—"}</p>
        <p><strong>Check-out:</strong> {todayLog.checkOut || "—"}</p>
        <p><strong>Break Status:</strong> {breakStatus}</p>
      </div>

      {/* Break History */}
      <h3 className={styles.subtitle}>Today's Breaks</h3>
      <div className={styles.history}>
        {breaks.length > 0 ? (
          <ul className={styles.breakList}>
            {breaks.map((brk, idx) => (
              <li key={idx} className={styles.breakItem}>
                {brk.start} - {brk.end || "Ongoing"}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noBreak}>No breaks today</p>
        )}
      </div>
    </Layout>
  );
};

export default Home;
