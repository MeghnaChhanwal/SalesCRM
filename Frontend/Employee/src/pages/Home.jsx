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
    if (employee?._id) {
      fetchTodayTiming();
      fetchBreakHistory();
      fetchRecentActivity();
    }
  }, [employee]);

  const fetchTodayTiming = async () => {
    try {
      const res = await API.get(`/api/timing/${employee._id}/today`);
      if (res.data?.length > 0) setTiming(res.data[0]);
    } catch (err) {
      console.error("Timing fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreakHistory = async () => {
    try {
      const res = await API.get(`/api/timing/${employee._id}/breaks`);
      const sorted = (res.data || []).sort((a, b) => {
        const aTime = new Date(`${a.date}T${a.start || "00:00"}`);
        const bTime = new Date(`${b.date}T${b.start || "00:00"}`);
        return bTime - aTime;
      });
      setBreaks(sorted);
    } catch (err) {
      console.error("Break fetch error", err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await API.get(`/api/activity/employee/${employee._id}`);
      setActivities(res.data || []);
    } catch (err) {
      console.error("Activity fetch error", err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  const latestBreak = breaks.length > 0 ? breaks[0] : null;

  return (
    <Layout>
      <div className={styles.container}>
        <p className={styles.sectionTitle}>Timings</p>

        <div className={styles.card}>
          <div className={styles.blueHeader}>
            <div className={styles.timingBlock}>
              <p className={styles.label}>Checked-In</p>
              <p className={styles.valueDark}>{timing?.checkIn || "--:--"}</p>
            </div>
            <div className={styles.timingBlock}>
              <p className={styles.label}>Check Out</p>
              <p className={styles.valueDark}>{timing?.checkOut || "--:--"}</p>
            </div>
            <div className={`${styles.indicator} ${styles.green}`} />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.blueHeader}>
            <div style={{ width: "100%" }}>
              <p className={styles.blueTitle}>Break</p>
            </div>

            <div className={styles.timingBlock}>
              <p className={styles.label}>Start</p>
              <p className={styles.valueDark}>{latestBreak?.start || "--:--"}</p>
            </div>
            <div className={styles.timingBlock}>
              <p className={styles.label}>Ended</p>
              <p className={styles.valueDark}>{latestBreak?.end || "--:--"}</p>
            </div>

            <div className={`${styles.indicator} ${styles.red}`} />
          </div>

          <div className={styles.historyHeader}>
            <span>Start</span>
            <span>Ended</span>
            <span>Date</span>
          </div>

          <div className={styles.scrollBox}>
            {breaks.length > 0 ? (
              breaks.map((b, idx) => (
                <div key={idx} className={styles.historyRow}>
                  <span>{b.start}</span>
                  <span>{b.end}</span>
                  <span>{new Date(b.date).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className={styles.empty}>No previous break history.</p>
            )}
          </div>
        </div>

        <h4 className={styles.sectionTitle}>Recent Activity</h4>
        <div className={styles.card}>
          <div className={styles.scrollBoxTall}>
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
      </div>
    </Layout>
  );
};

export default Home;
