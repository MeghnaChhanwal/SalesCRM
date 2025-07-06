import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

// ⏱️ Time ago formatter
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

const Home = () => {
  const { employee } = useAuth();
  const [timing, setTiming] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee) {
      fetchTodayTiming();
      fetchBreakHistory();
      fetchRecentActivity();
    }
  }, [employee]);

  const fetchTodayTiming = async () => {
    try {
      const res = await API.get(`/api/timing/${employee._id}/today`);
      if (res.data?.length > 0) {
        setTiming(res.data[0]);
      }
    } catch (err) {
      console.error("❌ Timing fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreakHistory = async () => {
    try {
      const res = await API.get(`/api/timing/${employee._id}/breaks`);
      setBreaks(res.data || []);
    } catch (err) {
      console.error("❌ Break fetch error", err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await API.get(`/api/activity/employee/${employee._id}`);
      setActivities(res.data || []);
    } catch (err) {
      console.error("❌ Activity fetch error", err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <Layout>
      <div className={styles.homeContainer}>
        {/* ==== Timing Card ==== */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Timing</h3>
            {timing?.checkIn && !timing?.checkOut && (
              <div className={styles.statusDot} title="Active"></div>
            )}
          </div>
          {timing ? (
            <ul className={styles.timingList}>
              
              <li><strong>Check-In:</strong> {timing.checkIn || "–"}</li>
              <li><strong>Check-Out:</strong> {timing.checkOut || "–"}</li>
              <li><strong>Status:</strong> {timing.status}</li>
              <li><strong>Break:</strong> {timing.breakStatus === "OnBreak" ? "On Break" : "Off Break"}</li>
            </ul>
          ) : (
            <p>No check-in record found today.</p>
          )}
        </div>

        {/* ==== Break Logs Card ==== */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
             <li><strong>Break:</strong> {timing.breakStatus === "OnBreak" ? "On Break" : "Off Break"}</li>
            <span className={styles.blueLabel}>Last 7 Days</span>
          </div>
          {breaks.length > 0 ? (
            <ul className={styles.breakList}>
              {breaks.map((b, idx) => (
                <li key={idx} className={styles.breakItem}>
                  <span>{new Date(b.date).toLocaleDateString()}:</span> <span>{b.start} → {b.end}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No completed breaks yet.</p>
          )}
        </div>

        {/* ==== Activity Log Card ==== */}
        <div className={styles.card}>
          <h3> Recent Activity</h3>
          {activities.length > 0 ? (
            <ul className={styles.activityList}>
              {activities.map((a, i) => (
                <li key={i}>
                  <span> {a.message}</span>
                  <small>{getTimeAgo(a.time)}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
