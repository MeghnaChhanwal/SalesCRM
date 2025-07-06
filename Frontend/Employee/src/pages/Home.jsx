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
        {/* === Greeting Header (optional) === */}
        <div className={styles.headerCard}>
          <p className={styles.greet}>Good Morning</p>
          <h2 className={styles.name}>{employee?.firstName} {employee?.lastName}</h2>
        </div>

        {/* === Timings Section === */}
        <h4 className={styles.sectionTitle}>Timings</h4>
        <div className={styles.cardRow}>
          <div className={`${styles.blueCard} ${styles.active}`}>
            <p className={styles.cardLabel}>Checked-In</p>
            <p className={styles.cardTime}>{timing?.checkIn || "--:--"}</p>
            <div className={styles.greenBar}></div>
          </div>
          <div className={styles.blueCard}>
            <p className={styles.cardLabel}>Check Out</p>
            <p className={styles.cardTime}>{timing?.checkOut || "--:--"}</p>
            <div className={styles.greenBar}></div>
          </div>
        </div>

        {/* === Latest Break === */}
        {timing?.breakStart && timing?.breakEnd && (
          <div className={`${styles.blueCard} ${styles.breakCard}`}>
            <p className={styles.cardLabel}>Break</p>
            <p className={styles.cardTime}>{timing.breakStart} → {timing.breakEnd}</p>
            <div className={styles.redBar}></div>
          </div>
        )}

        {/* === Break History Table === */}
        <div className={styles.breakHistory}>
          {breaks.slice(1, 5).map((b, idx) => (
            <div key={idx} className={styles.breakRow}>
              <span>{b.start}</span>
              <span>{b.end}</span>
              <span>{new Date(b.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>

        {/* === Recent Activity === */}
        <h4 className={styles.sectionTitle}>Recent Activity</h4>
        <div className={styles.recentBox}>
          {activities.length === 0 ? (
            <p className={styles.empty}>No recent activity.</p>
          ) : (
            <ul className={styles.activityList}>
              {activities.map((a, i) => (
                <li key={i}>
                  • {a.message}
                  <span className={styles.timeAgo}> — {getTimeAgo(a.time)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
