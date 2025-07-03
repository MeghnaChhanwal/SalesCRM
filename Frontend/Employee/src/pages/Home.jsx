// src/pages/Home.jsx

import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";

const Home = () => {
  const { employee } = useAuth();
  const [today, setToday] = useState(null);
  const [breakLogs, setBreakLogs] = useState([]);

  const formatTime = (iso) =>
    iso
      ? new Date(iso).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--";

  const getColor = (status) => {
    return status === "Active" ? "#27ae60" : "#e74c3c";
  };

  useEffect(() => {
    if (!employee?._id) return;

    const fetchTiming = async () => {
      try {
        const resToday = await API.get(`/api/timing/${employee._id}`);
        setToday(resToday.data?.[0] || null);

        const resBreaks = await API.get(`/api/timing/breaks/${employee._id}`);
        setBreakLogs(resBreaks.data || []);
      } catch (err) {
        console.error("❌ Fetch error:", err);
      }
    };

    fetchTiming();
  }, [employee]);

  // ✅ Auto-checkout on tab close (not refresh)
  useEffect(() => {
    if (!employee?._id) return;

    const handleUnload = () => {
      navigator.sendBeacon(
        `${import.meta.env.VITE_API_BASE}/api/timing/auto-checkout/${employee._id}`
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [employee]);

  const checkIn = formatTime(today?.checkIn);
  const breakStatus = today?.breakStatus || "OffBreak";
  const latestBreak = today?.breaks?.slice(-1)?.[0] || {};

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.headerBox}>
          <p className={styles.crmText}>
            Canova<span style={{ color: "#FFD700" }}>CRM</span>
          </p>
          <p className={styles.greet}>Good Morning</p>
          <p className={styles.name}>
            {employee?.firstName} {employee?.lastName}
          </p>
        </div>

        <h3 className={styles.sectionTitle}>Timings</h3>

        <div className={styles.cardRow}>
          <div className={styles.blueCard}>
            <p className={styles.label}>Checked-In</p>
            <p className={styles.time}>{checkIn}</p>
          </div>
          <div className={styles.blueCard}>
            <p className={styles.label}>Status</p>
            <p className={styles.time}>{today?.status || "Inactive"}</p>
            <span
              className={styles.statusDot}
              style={{ backgroundColor: getColor(today?.status) }}
            />
          </div>
        </div>

        <div className={styles.cardRow}>
          <div className={styles.blueCard}>
            <p className={styles.label}>Break Start</p>
            <p className={styles.time}>{formatTime(latestBreak?.start)}</p>
          </div>
          <div className={styles.blueCard}>
            <p className={styles.label}>Break End</p>
            <p className={styles.time}>{formatTime(latestBreak?.end)}</p>
            <span
              className={styles.statusDot}
              style={{
                backgroundColor: getColor(
                  breakStatus === "OnBreak" ? "Inactive" : "Active"
                ),
              }}
            />
          </div>
        </div>

        <div className={styles.historyBox}>
          {breakLogs.length === 0 && (
            <p className={styles.noData}>No break logs found.</p>
          )}
          {breakLogs.map((log, i) =>
            log.breaks
              ?.filter((b) => b.start && b.end)
              .map((b, idx) => (
                <div key={`${i}-${idx}`} className={styles.breakRow}>
                  <div>
                    <p className={styles.breakLabel}>Break</p>
                    <p className={styles.breakTime}>{formatTime(b.start)}</p>
                  </div>
                  <div>
                    <p className={styles.breakLabel}>Ended</p>
                    <p className={styles.breakTime}>{formatTime(b.end)}</p>
                  </div>
                  <div>
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
