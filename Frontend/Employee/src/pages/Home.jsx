// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Home = () => {
  const { employee } = useAuth();
  const [timing, setTiming] = useState(null);
  const [breakHistory, setBreakHistory] = useState([]);

  useEffect(() => {
    if (employee && employee._id) {
      fetchTiming();
      fetchBreakHistory();
    }
  }, [employee]);

  const fetchTiming = async () => {
    try {
      const res = await API.get(`/api/timing/${employee._id}`);
      const timingData = Array.isArray(res.data) ? res.data[0] : res.data;
      setTiming(timingData || null);
    } catch (err) {
      console.error("Fetch timing error:", err.response?.data || err.message);
      setTiming(null);
    }
  };

  const fetchBreakHistory = async () => {
    try {
      const res = await API.get(`/api/timing/history/${employee._id}`);
      setBreakHistory(res.data || []);
    } catch (err) {
      console.error("Fetch break history error:", err);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
    const iso = new Date(timeStr);
    if (!isNaN(iso.getTime())) {
      return iso.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    }
    return timeStr;
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "--/--/----";
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  if (!timing) {
    return (
      <Layout>
        <div className={styles.container}>Loading...</div>
      </Layout>
    );
  }

  const lastBreak = timing.breaks?.[timing.breaks.length - 1];

  return (
    <Layout>
      <div className={styles.container}>
        {/* Main Timing */}
        <div className={styles.card}>
          <div className={styles.timingHeader}>
            <div>
              <p className={styles.label}>Checked-In</p>
              <p className={styles.time}>{formatTime(timing.checkIn)}</p>
            </div>
            <div>
              <p className={styles.label}>Check Out</p>
              <p className={styles.time}>{formatTime(timing.checkOut)}</p>
            </div>
            <div
              className={
                timing.breakStatus === "OnBreak"
                  ? styles.redBar
                  : styles.greenBar
              }
            />
          </div>
        </div>

        {/* Last Break Info */}
        {lastBreak && (
          <div className={styles.card}>
            <div className={styles.timingHeader}>
              <div>
                <p className={styles.label}>Break</p>
                <p className={styles.time}>{formatTime(lastBreak.start)}</p>
              </div>
              <div>
                <p className={styles.label}>Ended</p>
                <p className={styles.time}>{formatTime(lastBreak.end)}</p>
              </div>
              <div className={styles.redBar} />
            </div>
          </div>
        )}

        {/* Break History */}
        {breakHistory.length > 0 && (
          <div className={styles.breakHistory}>
            {breakHistory.map((brk, i) => (
              <div key={i} className={styles.breakRow}>
                <span>{formatTime(brk.start)}</span>
                <span>{formatTime(brk.end)}</span>
                <span>{formatDate(brk.date)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Activity */}
        <div className={styles.activityCard}>
          <h4>Recent Activity</h4>
          <ul>
            <li>You were assigned 3 more new lead – 1 hour ago</li>
            <li>You Closed a deal today – 2 hours ago</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
