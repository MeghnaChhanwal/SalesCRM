import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../utils/axios";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Home = () => {
  const { employee } = useAuth();
  const [checkIn, setCheckIn] = useState("");

  useEffect(() => {
    const fetchCheckIn = async () => {
      if (!employee?._id) return;

      try {
        const res = await API.get(`/api/timings/${employee._id}`);
        const today = res.data?.[0]; // today is always first
        setCheckIn(today?.checkIn || "");
      } catch (err) {
        console.error("Error fetching check-in time", err);
      }
    };

    fetchCheckIn();
  }, [employee]);

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.heading}>Hi, {employee?.firstName} 👋</h2>
        <div className={styles.card}>
          <p><strong>Check-in Time:</strong> {checkIn || "—"}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
