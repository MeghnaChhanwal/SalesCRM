import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import moment from "moment-timezone";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/Layout";
import styles from "../styles/Home.module.css";

const API_BASE = import.meta.env.VITE_API_BASE;

// Format time in 12-hour IST
const formatISTTime = (timeStr) => {
  if (!timeStr) return "--:--";
  return moment(timeStr, "HH:mm:ss").format("hh:mm:ss A");
};

const Home = () => {
  const { employee } = useAuth();
  const [timing, setTiming] = useState(null);
  const [breakDuration, setBreakDuration] = useState("00:00:00");

  // ✅ Fetch today's timing data
  const fetchTiming = useCallback(async () => {
    if (!employee?._id) return;
    try {
      const res = await axios.get(`${API_BASE}/api/timing/today/${employee._id}`);
      const todayRecord = res.data[0]; // Only latest record for today
      if (todayRecord) {
        const ongoingBreak = todayRecord.breaks?.find(b => b.start && !b.end);
        const completedBreaks = todayRecord.breaks?.filter(b => b.start && b.end) || [];

        setTiming({
          checkIn: todayRecord.checkIn,
          checkOut: todayRecord.checkOut,
          isActive: todayRecord.status === "Active",
          isOnBreak: !!ongoingBreak,
          breakStart: ongoingBreak?.start || null,
          previousBreaks: completedBreaks,
        });
      }
    } catch (err) {
      console.error("Failed to fetch timing:", err);
    }
  }, [employee]);

  // ✅ Live break duration calculation
  useEffect(() => {
    let interval;

    if (timing?.isOnBreak && timing.breakStart) {
      interval = setInterval(() => {
        const start = moment(timing.breakStart, "HH:mm:ss");
        const now = moment();
        const diff = moment.duration(now.diff(start));
        const formatted = `${String(diff.hours()).padStart(2, "0")}:${String(diff.minutes()).padStart(2, "0")}:${String(diff.seconds()).padStart(2, "0")}`;
        setBreakDuration(formatted);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timing]);

  // ✅ Determine current status
  const getStatus = () => {
    if (!timing?.checkIn) return "Offline";
    if (timing.isOnBreak) return "On Break";
    if (timing.isActive) return "Active";
    if (timing.checkOut) return "Inactive";
    return "Unknown";
  };

  useEffect(() => {
    fetchTiming();
    const interval = setInterval(fetchTiming, 60000); // every 1 minute
    return () => clearInterval(interval);
  }, [fetchTiming]);

  return (
    <PageLayout>
      <div className={styles.container}>
        <h2 className={styles.greeting}>Welcome, {employee?.name || "Employee"}!</h2>

        <div className={styles.card}>
          <h3>Check-in Time</h3>
          <p>{timing?.checkIn ? formatISTTime(timing.checkIn) : "Not checked-in"}</p>
        </div>

        <div className={styles.card}>
          <h3>Status</h3>
          <p className={`${styles.status} ${
            getStatus() === "Active"
              ? styles.active
              : getStatus() === "On Break"
              ? styles.break
              : getStatus() === "Inactive"
              ? styles.inactive
              : styles.offline
          }`}>
            {getStatus()}
          </p>
        </div>

        {timing?.checkOut && (
          <div className={styles.card}>
            <h3>Check-out Time</h3>
            <p>{formatISTTime(timing.checkOut)}</p>
          </div>
        )}

        {timing?.isOnBreak && (
          <div className={styles.card}>
            <h3>Break Started At</h3>
            <p>{formatISTTime(timing.breakStart)}</p>
            <p><strong>Break Duration:</strong> {breakDuration}</p>
          </div>
        )}

        {timing?.previousBreaks?.length > 0 && (
          <div className={styles.card}>
            <h3>Previous Breaks</h3>
            <ul className={styles.breakList}>
              {timing.previousBreaks.map((b, i) => (
                <li key={i}>
                  {b.date} — {formatISTTime(b.start)} ➝ {formatISTTime(b.end)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Home;
