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
      const res = await API.get(`/api/timing/breaks/${employee._id}`);
      const last7 = res.data.slice(0, 7);
      setBreakHistory(last7);
    } catch (err) {
      console.error("Fetch break history error:", err);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-IN", {
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

  const lastBreak = timing?.breaks?.[timing.breaks.length - 1];

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.headerCard}>
          <p className={styles.welcome}>Good Morning</p>
          <h2 className={styles.name}>{employee?.firstName} {employee?.lastName}</h2>
        </div>

        <h3 className={styles.sectionTitle}>Timings</h3>

        {/* Check-In / Check-Out */}
        <div className={styles.timingCard}>
          <div>
            <p className={styles.label}>Checked-In</p>
            <p className={styles.time}>{formatTime(timing?.checkIn)}</p>
          </div>
          <div>
            <p className={styles.label}>Check Out</p>
            <p className={styles.time}>{formatTime(timing?.checkOut)}</p>
          </div>
          <div
            className={
              timing?.breakStatus === "OnBreak"
                ? styles.redStatus
                : styles.greenStatus
            }
          />
        </div>

        {/* Last Break Section */}
        {lastBreak && (
          <div className={styles.timingCard}>
            <div>
              <p className={styles.label}>Break</p>
              <p className={styles.time}>{formatTime(lastBreak.start)}</p>
            </div>
            <div>
              <p className={styles.label}>Ended</p>
              <p className={styles.time}>{formatTime(lastBreak.end)}</p>
            </div>
            <div className={styles.redStatus} />
          </div>
        )}

        {/* Break History (last 7 days) */}
        <div className={styles.breakHistory}>
          {breakHistory.map((brk, i) => (
            <div key={i} className={styles.breakRow}>
              <span>Break {formatTime(brk.start)}</span>
              <span>Ended {formatTime(brk.end)}</span>
              <span>Date {formatDate(brk.date)}</span>
            </div>
          ))}
        </div>

        {/* Static Activity */}
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
