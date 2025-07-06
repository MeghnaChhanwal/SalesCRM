import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

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
      <div className={styles.container}>
        {/* === Timing Box === */}
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div>
              <p className={styles.label}>Checked-In</p>
              <p className={styles.time}>{timing?.checkIn || "--:--"}</p>
            </div>
            <div style={{ marginLeft: "30px" }}>
              <p className={styles.label}>Check Out</p>
              <p className={styles.time}>{timing?.checkOut || "--:--"}</p>
            </div>
          </div>
          {!timing?.checkOut && <div className={styles.greenBar}></div>}
        </div>

        {/* === Recent Break === */}
        {timing?.breakStart && timing?.breakEnd && (
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <div>
                <p className={styles.label}>Break</p>
                <p className={styles.time}>
                  {timing.breakStart} → {timing.breakEnd}
                </p>
              </div>
            </div>
            <div className={styles.redBar}></div>
          </div>
        )}

        {/* === Break History Table === */}
        <div className={styles.historyBox}>
          <div className={styles.breakHeader}>
            <span>Break</span>
            <span>Ended</span>
            <span>Date</span>
          </div>
          <div className={styles.scrollBox}>
            {breaks.slice(1).map((b, idx) => (
              <div key={idx} className={styles.breakRow}>
                <span>{b.start}</span>
                <span>{b.end}</span>
                <span>{new Date(b.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
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
