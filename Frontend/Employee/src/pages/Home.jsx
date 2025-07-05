import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios"; // Axios instance with baseURL
import Layout from "../components/Layout"; // Wraps with nav, header, etc.
import styles from "../styles/Home.module.css";

const Home = () => {
  const { employee } = useAuth();
  const [timing, setTiming] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee) {
      fetchTodayTiming();
      fetchBreakHistory();
    }
  }, [employee]);

  const fetchTodayTiming = async () => {
    try {
      const res = await API.get(`/api/timing/${employee._id}`);
      if (res.data?.length > 0) {
        setTiming(res.data[0]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch timing:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreakHistory = async () => {
    try {
      const res = await API.get(`/api/timing/breaks/${employee._id}`);
      setBreaks(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch breaks:", err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <Layout>
      <div className={styles.homeContainer}>
        <h2>Welcome, {employee.fullName}</h2>

        <div className={styles.card}>
          <h3>🕒 Today's Timing</h3>
          {timing ? (
            <ul>
              <li><strong>Date:</strong> {timing.date}</li>
              <li><strong>Check In:</strong> {timing.checkIn || "–"}</li>
              <li><strong>Check Out:</strong> {timing.checkOut || "–"}</li>
              <li><strong>Status:</strong> {timing.status}</li>
              <li><strong>Break:</strong> {timing.breakStatus}</li>
            </ul>
          ) : (
            <p>No check-in found today.</p>
          )}
        </div>

        <div className={styles.card}>
          <h3>⏸ Break History</h3>
          {breaks.length > 0 ? (
            <ul className={styles.breakList}>
              {breaks.map((b, idx) => (
                <li key={idx}>
                  <span>{b.date}:</span> {b.start} → {b.end}
                </li>
              ))}
            </ul>
          ) : (
            <p>No completed breaks found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
