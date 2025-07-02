// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const Home = () => {
  const { employee } = useAuth();
  const [today, setToday] = useState(null);
  const [breakLogs, setBreakLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format helper
  const formatTime = (iso) =>
    iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--:--";

  const getColor = (status) => {
    return status === "Active" ? "#27ae60" : "#999999"; // green or grey
  };

  useEffect(() => {
    if (!employee?._id) return;

    const fetchTodayAndHistory = async () => {
      setLoading(true);
      try {
        // today’s timing
        const resToday = await axios.get(`${API_BASE}/api/timing/${employee._id}`);
        const todayData = resToday.data?.[0] || null;
        setToday(todayData);

        // past 7 days history
        const resLogs = await axios.get(`${API_BASE}/api/timing/week/${employee._id}`);
        setBreakLogs(resLogs.data || []);
      } catch (err) {
        console.error("Failed to load timing:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAndHistory();
  }, [employee]);

  const checkIn = formatTime(today?.checkIn);
  const checkOut = formatTime(today?.checkOut);
  const breakStatus = today?.breakStatus || "OffBreak";

  return (
    <Layout>
      <div className={styles.container}>
        <h3 className={styles.sectionTitle}>Timings</h3>

        {/* Check-in & Check-out box */}
        <div className={styles.cardRow}>
          <div className={styles.card}>
            <p className={styles.label}>Checked-In</p>
            <p className={styles.time}>{checkIn}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.label}>Check Out</p>
            <p className={styles.time}>{checkOut}</p>
            <span
              className={styles.statusDot}
              style={{ backgroundColor: getColor(today?.status) }}
            />
          </div>
        </div>

        {/* Break Status box */}
        <div className={styles.cardRow}>
          <div className={styles.card}>
            <p className={styles.label}>Break</p>
            <p className={styles.time}>{breakStatus}</p>
            <span
              className={styles.statusDot}
              style={{ backgroundColor: getColor(breakStatus === "OffBreak" ? "Inactive" : "Active") }}
            />
          </div>
        </div>

        {/* Break History Table */}
        <div className={styles.history}>
          {breakLogs.map((log, i) =>
            log.breaks
              .filter((br) => br.start && br.end)
              .map((brk, idx) => (
                <div key={`${i}-${idx}`} className={styles.historyItem}>
                  <div className={styles.breakCol}>
                    <p className={styles.breakLabel}>Break</p>
                    <p className={styles.breakTime}>{formatTime(brk.start)}</p>
                  </div>
                  <div className={styles.breakCol}>
                    <p className={styles.breakLabel}>Ended</p>
                    <p className={styles.breakTime}>{formatTime(brk.end)}</p>
                  </div>
                  <div className={styles.breakCol}>
                    <p className={styles.breakLabel}>Date</p>
                    <p className={styles.breakTime}>
                      {new Date(log.date).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
