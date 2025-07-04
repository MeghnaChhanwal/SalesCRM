// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Home = () => {
  const { employee } = useAuth();
  const [timing, setTiming] = useState(null);

  useEffect(() => {
    if (employee) fetchTiming();
  }, [employee]);

  const fetchTiming = async () => {
    try {
      const res = await API.get(`/api/timing/${employee._id}`);
      if (res.data && res.data.length > 0) {
        setTiming(res.data[0]); // Use first timing record
      } else {
        setTiming(null);
      }
    } catch (err) {
      console.error("Fetch timing error:", err);
    }
  };

  // Parse "05:38 am" style time strings to proper formatted time
  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";

    // Normalize and split time and meridian
    const normalized = timeStr.trim().toUpperCase(); // "05:38 AM"
    const [time, meridian] = normalized.split(" ");
    if (!time || !meridian) return "--:--";

    let [hours, minutes] = time.split(":").map(Number);

    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "--/--/----";
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h3 className={styles.welcome}>Good Morning, {employee?.firstName}</h3>

        <div className={styles.card}>
          <div className={styles.headerRow}>
            <div>
              <strong>Checked-In</strong>
              <p>{formatTime(timing?.checkIn)}</p>
            </div>
            <div>
              <strong>Check Out</strong>
              <p>{formatTime(timing?.checkOut)}</p>
            </div>
            <div className={styles.status}>
              <div
                className={
                  timing?.status === "Active" ? styles.greenDot : styles.redDot
                }
              ></div>
            </div>
          </div>
        </div>

        {/* Break History */}
        {timing?.breaks?.length > 0 && (
          <div className={styles.breakCard}>
            <div className={styles.breakHeader}>
              <strong>Break</strong>
              <strong>Ended</strong>
              <strong>Date</strong>
            </div>

            {timing.breaks
              .filter((b) => b.start && b.end)
              .map((brk, i) => (
                <div key={i} className={styles.breakRow}>
                  <span>{formatTime(brk.start)}</span>
                  <span>{formatTime(brk.end)}</span>
                  <span>{formatDate(timing.date)}</span>
                </div>
              ))}
          </div>
        )}

        {/* Recent Activity (Mock) */}
        <div className={styles.activityCard}>
          <h4>Recent Activity</h4>
          <ul>
            <li>You were assigned 3 more new leads – 1 hour ago</li>
            <li>You closed a deal today – 2 hours ago</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
