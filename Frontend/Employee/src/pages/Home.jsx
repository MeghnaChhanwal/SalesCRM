// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment-timezone";
import styles from "../styles/Home.module.css";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE;

const Home = () => {
  const { employee } = useAuth();
  const [todayTiming, setTodayTiming] = useState(null);
  const [breakHistory, setBreakHistory] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchTodayAndHistory = async () => {
    try {
      if (!employee?._id) return;

      // 1. Fetch today's timing
      const { data: today } = await axios.get(`${API_BASE}/api/timing/${employee._id}`);
      setTodayTiming(today[0] || null);

      // 2. Fetch past 7 days for break history and activity
      const { data: past7 } = await axios.get(`${API_BASE}/api/timing/history/${employee._id}`);
      const groupedByDate = {};

      past7.forEach((entry) => {
        if (!groupedByDate[entry.date]) groupedByDate[entry.date] = [];
        groupedByDate[entry.date].push(...entry.breaks);
      });

      setBreakHistory(groupedByDate);

      // 3. Build recent activity list
      const recent = past7
        .flatMap((log) => {
          const actions = [];

          if (log.checkIn) actions.push({ type: "Check In", time: log.checkIn, date: log.date });
          if (log.checkOut) actions.push({ type: "Check Out", time: log.checkOut, date: log.date });

          log.breaks.forEach((b) => {
            if (b.start && b.end) {
              actions.push({
                type: "Break",
                time: `${b.start} - ${b.end}`,
                date: log.date,
              });
            }
          });

          return actions;
        })
        .sort((a, b) => {
          const aTime = moment(`${a.date} ${a.time.split(" - ")[0]}`, "YYYY-MM-DD HH:mm");
          const bTime = moment(`${b.date} ${b.time.split(" - ")[0]}`, "YYYY-MM-DD HH:mm");
          return bTime - aTime;
        })
        .slice(0, 10);

      setRecentActivity(recent);
    } catch (error) {
      console.error("Failed to load timing:", error);
    }
  };

  useEffect(() => {
    fetchTodayAndHistory();
  }, [employee]);

  const formatTime = (t) => moment(t, "HH:mm").format("hh:mm A");

  return (
    <div className={styles.container}>
      <div className={styles.greeting}>
        Hello, <strong>{employee?.firstName}</strong>
      </div>

      {todayTiming && (
        <div className={styles.timingCard}>
          <div className={styles.cardRow}>
            <span>Check In:</span>
            <span>{formatTime(todayTiming.checkIn)}</span>
          </div>
          {todayTiming.checkOut && (
            <div className={styles.cardRow}>
              <span>Check Out:</span>
              <span>{formatTime(todayTiming.checkOut)}</span>
            </div>
          )}
          <div className={styles.cardRow}>
            <span>Status:</span>
            <div
              className={`${styles.statusLight} ${
                todayTiming.checkOut
                  ? styles.inactive
                  : todayTiming.breaks.some((b) => !b.end)
                  ? styles.break
                  : styles.active
              }`}
            />
          </div>
        </div>
      )}

      <div className={styles.breakCard}>
        <h4>Break History (Past 7 Days)</h4>
        <div className={styles.breakHistory}>
          {Object.keys(breakHistory).length === 0 ? (
            <p>No break data available.</p>
          ) : (
            Object.entries(breakHistory).map(([date, breaks]) => (
              <div key={date} className={styles.breakBlock}>
                <strong>{moment(date).format("ddd, MMM D")}</strong>
                {breaks.map((brk, i) => (
                  <div key={i} className={styles.breakRow}>
                    <span>{formatTime(brk.start)} - {formatTime(brk.end)}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.activityCard}>
        <h4>Recent Activity</h4>
        <ul className={styles.activityList}>
          {recentActivity.length === 0 ? (
            <li>No recent activity.</li>
          ) : (
            recentActivity.map((act, idx) => (
              <li key={idx}>
                [{moment(act.date).format("MMM D")}] {act.type}:{" "}
                {act.time.includes(" - ") ? act.time : formatTime(act.time)}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Home;
