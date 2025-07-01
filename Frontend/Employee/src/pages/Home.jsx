import React from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/Home.module.css";

const Home = () => {
  const { employee } = useAuth();

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.heading}>Welcome, {employee?.firstName} 👋</h2>

        <div className={styles.card}>
          <p><strong>Email:</strong> {employee?.email}</p>
          <p><strong>Status:</strong> {employee?.status}</p>
        </div>

        <p className={styles.note}>You're now logged in. Use the bottom nav to explore Leads, Schedule, and Profile.</p>
      </div>
    </Layout>
  );
};

export default Home;
