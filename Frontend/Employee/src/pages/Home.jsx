import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Home = () => {
  const { employee } = useAuth();
  const [timing, setTiming] = useState(null);

  useEffect(() => {
    if (employee && employee._id) {
      fetchTiming();
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

  // 🕒 Format time (supports both ISO and "hh:mm AM/PM")
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

    const normalized = timeStr.trim().toUpperCase();
    const [time, meridian] = normalized.split(" ");
    if (!time || !meridian) return "--:--";

    let [hours, minutes] = time.split(":").map(Number);
    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // 📅 Format date
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

  return (
    <Layout>
      <div className={styles.container}>
        {/* Main Timing Card */}
        <div className={styles.card}>
          <div className={styles.timingHeader}>
            <div>
              <p className={styles.label}>Checked-In</p>
              <p className={styles.time}>{formatTime(timing?.checkIn)}</p>
            </div>
            <div>
              <p className={styles.label}>Check Out</p>
              <p className={styles.time}>--:--</p>
            </div>
            <div
              className={
                timing?.breakStatus === "OnBreak"
                  ? styles.redBar
                  : styles.greenBar
              }
            />
          </div>
        </div>

        {/* Latest Break Card */}
        {timing?.breaks?.length > 0 && (
          <div className={styles.card}>
            <div className={styles.timingHeader}>
              <div>
                <p className={styles.label}>Break</p>
                <p className={styles.time}>
                  {formatTime(timing.breaks[timing.breaks.length - 1]?.start)}
                </p>
              </div>
              <div>
                <p className={styles.label}>Ended</p>
                <p className={styles.time}>
                  {formatTime(timing.breaks[timing.breaks.length - 1]?.end)}
                </p>
              </div>
              <div className={styles.redBar} />
            </div>
          </div>
        )}

        {/* Break History */}
        {timing?.breaks?.filter((b) => b.start && b.end)?.length > 0 && (
          <div className={styles.breakHistory}>
            {timing.breaks
              .filter((b) => b.start && b.end)
              .reverse()
              .map((brk, index) => (
                <div key={index} className={styles.breakRow}>
                  <span>{formatTime(brk.start)}</span>
                  <span>{formatTime(brk.end)}</span>
                  <span>{formatDate(timing.date)}</span>
                </div>
              ))}
          </div>
        )}

        {/* Recent Activity */}
        <div className={styles.activityCard}>
          <h4>Recent Activity</h4>
          <ul>
            <li>You were assigned 3 more new leads – 1 hour ago</li>
            <li>You closed a deal today – 2 hours ago</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
