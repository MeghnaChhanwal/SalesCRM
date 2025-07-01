import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import styles from "../styles/Login.module.css";

const API_BASE = import.meta.env.VITE_API_BASE;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // lastName
  const { setEmployee } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });

      const employee = {
        _id: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        status: data.status,
      };

      setEmployee(employee);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBottomNav={false}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Employee Login</h2>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            name="email"
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Last Name"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            name="password"
            required
            autoComplete="current-password"
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Login;
