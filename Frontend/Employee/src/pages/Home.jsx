import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

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
      const res = await API.get(`/api/timing/${employee._id}`);
      if (res.data?.length > 0) setTiming(res.data[0]);
    } catch (err) {
      console.error("❌ Timing fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreakHistory = async () => {
    try {
      const res = await API.get(`/api/timing/breaks/${employee._id}`);
      setBreaks(res.data.slice(0, 7)); // latest 7
    } catch (err) {
      console.error("❌ Break fetch error", err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await API.get(`/api/leads/activity/${employee._id}`);
      setActivities(res.data.slice(0, 5));
    } catch (err) {
      console.error("❌ Activity fetch error", err);
    }
  };

  const renderIndicator = () => {
    if (timing?.checkIn && !timing?.checkOut) {
      return <span className={styles.statusDotGreen}></span>;
    }
    if (timing?.checkOut) {
      return <span className={styles.statusDotRed}></span>;
    }
    return null;
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <Layout>
      <div className={styles.homeContainer}>
        <div className={styles.timingsCard}>
          <div className={styles.timingsHeader}>
            <div className={styles.checkinBox}>
              <p>Checked-In</p>
              <h3>{timing?.checkIn || "--:--"}</h3>
            </div>
            <div className={styles.checkoutBox}>
              <p>Check Out</p>
              <h3>{timing?.checkOut || "--:--"}</h3>
              {renderIndicator()}
            </div>
          </div>

          <div className={styles.breakCard}>
            <div className={styles.breakTitle}>
              <p>Break</p>
              <p>{timing?.breaks?.length > 0 ? `${timing.breaks.slice(-1)[0].start} → ${timing.breaks.slice(-1)[0].end || "--:--"}` : "--:--"}</p>
            </div>
            <table className={styles.breakTable}>
              <thead>
                <tr>
                  <th>Break</th>
                  <th>Ended</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {breaks.map((b, i) => (
                  <tr key={i}>
                    <td>{b.start}</td>
                    <td>{b.end || "--:--"}</td>
                    <td>{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.activityCard}>
          <h3>Recent Activity</h3>
          {activities.length > 0 ? (
            <ul>
              {activities.map((act, idx) => (
                <li key={idx}>• {act.message} – {act.timeAgo}</li>
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
