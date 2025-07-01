import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const Home = () => {
  const { employee } = useAuth();
  const [checkInTime, setCheckInTime] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!employee?._id) return;

    const fetchTiming = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/timing/${employee._id}`);
        if (res.data) {
          setCheckInTime(res.data.checkIn);
          setStatus(res.data.status);
        }
      } catch (err) {
        console.error("Failed to fetch timing:", err);
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
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Check-in Time:</strong> {checkInTime ? checkInTime : "Fetching..."}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
