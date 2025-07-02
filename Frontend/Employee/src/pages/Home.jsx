import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const Home = () => {
  const { employee } = useAuth();

  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [status, setStatus] = useState("");
  const [breakStatus, setBreakStatus] = useState("");

  // ⏰ Format time as "hh:mm AM/PM"
  const formatTime = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🔁 Fetch today's timing data
  useEffect(() => {
    if (!employee?._id) return;

    const fetchTiming = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/timing/${employee._id}`);
        const todayTiming = res.data?.[0]; // backend returns array

        if (todayTiming) {
          setCheckInTime(todayTiming.checkIn);
          setCheckOutTime(todayTiming.checkOut || null);
          setStatus(todayTiming.status);
          setBreakStatus(todayTiming.breakStatus);
        } else {
          setCheckInTime(null);
          setCheckOutTime(null);
          setStatus("Not checked in");
          setBreakStatus("N/A");
        }
      } catch (err) {
        console.error("❌ Failed to fetch timing:", err);
        setCheckInTime(null);
        setCheckOutTime(null);
        setStatus("Error fetching");
        setBreakStatus("N/A");
      }
    };

    fetchTiming();
  }, [employee]);

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.heading}>Welcome, {employee?.firstName}</h2>

        <div className={styles.card}>
          <p><strong>Email:</strong> {employee?.email}</p>
          <p><strong>Status:</strong> {status || "Unavailable"}</p>
          <p><strong>Check-in Time:</strong> {checkInTime ? formatTime(checkInTime) : "Not Available"}</p>
          <p><strong>Check-out Time:</strong> {checkOutTime ? formatTime(checkOutTime) : "Pending"}</p>
          <p><strong>Break Status:</strong> {breakStatus || "N/A"}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
