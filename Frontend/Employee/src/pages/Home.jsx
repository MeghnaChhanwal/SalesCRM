import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import moment from "moment-timezone";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/Layout";
import styles from "../styles/Home.module.css";

const API_BASE = import.meta.env.VITE_API_BASE;

// Format time in 12-hour IST format
const formatISTTime = (timeStr) => {
  if (!timeStr) return "--:--";
  return moment(timeStr, "HH:mm:ss").tz("Asia/Kolkata").format("hh:mm:ss A");
};

const Home = () => {
  const { employee } = useAuth();
  const [timing, setTiming] = useState(null);

  // ✅ Fetch timing data
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

  // ✅ Final checkout on tab close only (not refresh)
  const handleFinalCheckout = useCallback(() => {
    if (document.visibilityState === "hidden" && employee?._id) {
      navigator.sendBeacon(
        `${API_BASE}/api/timing/final-check-out/${employee._id}`
      );
    }
  }, [employee]);

  // ✅ Mount
  useEffect(() => {
    fetchTiming();
    const interval = setInterval(fetchTiming, 60000);

    document.addEventListener("visibilitychange", handleFinalCheckout);
    window.addEventListener("unload", handleFinalCheckout);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleFinalCheckout);
      window.removeEventListener("unload", handleFinalCheckout);
    };
  }, [fetchTiming, handleFinalCheckout]);

  return (
    <PageLayout>
      <div className={styles.container}>
        <h2>Welcome, {employee?.firstName || "Employee"}</h2>

        <div className={styles.card}>
          <h3>Check-in Time:</h3>
          <p>{timing?.checkIn ? formatISTTime(timing.checkIn) : "Not Checked-in"}</p>
        </div>

        <div className={styles.card}>
          <h3>Status:</h3>
          <p
            className={`${styles.status} ${
              getStatus() === "Active"
                ? styles.active
                : getStatus() === "Inactive"
                ? styles.inactive
                : getStatus() === "On Break"
                ? styles.break
                : styles.offline
            }`}
          >
            {getStatus()}
          </p>
        </div>

        {timing?.isOnBreak && (
          <div className={styles.card}>
            <h3>Break Started At:</h3>
            <p>{formatISTTime(timing.breakStart)}</p>
          </div>
        )}

        {timing?.previousBreaks?.length > 0 && (
          <div className={styles.card}>
            <h3>Previous Breaks:</h3>
            <ul>
              {timing.previousBreaks.map((b, index) => (
                <li key={index}>
                  {b.date}: {formatISTTime(b.start)} → {formatISTTime(b.end)}
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
