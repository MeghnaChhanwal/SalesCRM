import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import moment from "moment-timezone";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/Layout";
import styles from "../styles/Home.module.css";

const API_BASE = import.meta.env.VITE_API_BASE;

// Format time in 12-hour IST
const formatISTTime = (timeStr) => {
  if (!timeStr) return "--:--";
  return moment(timeStr, "HH:mm:ss").tz("Asia/Kolkata").format("hh:mm:ss A");
};

const Home = () => {
  const { employee } = useAuth();
  const [timing, setTiming] = useState(null);

  // ✅ Fetch today's timing data
  const fetchTiming = useCallback(async () => {
    if (!employee?._id) return;
    try {
      const res = await axios.get(`${API_BASE}/api/timing/today/${employee._id}`);
      setTiming(res.data);
    } catch (err) {
      console.error("Failed to fetch timing:", err);
    }
  }, [employee]);

  // ✅ Determine current status
  const getStatus = () => {
    if (!timing?.checkIn) return "Offline";
    if (timing.isOnBreak) return "On Break";
    if (timing.isActive) return "Active";
    if (timing.checkOut) return "Inactive";
    return "Unknown";
  };

  useEffect(() => {
    fetchTiming();
    const interval = setInterval(fetchTiming, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [fetchTiming]);

  return (
    <PageLayout>
      <div className={styles.container}>
        <h2>Welcome, {employee?.firstName || "Employee"}</h2>

        <div className={styles.card}>
          <h3>Check-in Time</h3>
          <p>{timing?.checkIn ? formatISTTime(timing.checkIn) : "Not checked-in"}</p>
        </div>

        <div className={styles.card}>
          <h3>Status</h3>
          <p
            className={`${styles.status} ${
              getStatus() === "Active"
                ? styles.active
                : getStatus() === "On Break"
                ? styles.break
                : getStatus() === "Inactive"
                ? styles.inactive
                : styles.offline
            }`}
          >
            {getStatus()}
          </p>
        </div>

        {timing?.isOnBreak && (
          <div className={styles.card}>
            <h3>Break Started At</h3>
            <p>{formatISTTime(timing.breakStart)}</p>
          </div>
        )}

        {timing?.previousBreaks?.length > 0 && (
          <div className={styles.card}>
            <h3>Previous Breaks</h3>
            <ul className={styles.breakList}>
              {timing.previousBreaks.map((b, i) => (
                <li key={i}>
                  {b.date} — {formatISTTime(b.start)} ➝ {formatISTTime(b.end)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Home;
