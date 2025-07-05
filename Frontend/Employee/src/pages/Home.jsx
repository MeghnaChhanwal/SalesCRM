// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Home = () => {
  const { employee } = useAuth();
  const [checkInTime, setCheckInTime] = useState("--:--");

  useEffect(() => {
    if (employee) {
      fetchCheckIn();
    }
  }, [employee]);

  const fetchCheckIn = async () => {
    try {
      const res = await API.get(`/api/timing/today/${employee._id}`);
      const checkIn = res.data?.timing?.checkIn;
      if (checkIn) {
        setCheckInTime(formatTime(checkIn));
      }
    } catch (error) {
      console.error("Error fetching check-in time:", error);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
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

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Check-In Time</h2>
          <p className={styles.checkinTime}>{checkInTime}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
