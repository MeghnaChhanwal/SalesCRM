import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/Layout";
import styles from "../styles/Login.module.css";

const API_BASE = import.meta.env.VITE_API_BASE;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setEmployee } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return alert("Email and password are required!");

    setLoading(true);
    try {
      // Step 1: Login
      const res = await axios.post(`${API_BASE}/api/employees/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const user = res.data;

      // Step 2: Check if already active
      const timingRes = await axios.get(`${API_BASE}/api/timing/today/${user._id}`);
      if (timingRes.data?.isActive) {
        return alert("This user is already logged in on another device.");
      }

      // Step 3: Check-in after successful login
      await axios.post(`${API_BASE}/api/timing/check-in/${user._id}`);

      // Step 4: Save to sessionStorage
      sessionStorage.setItem("employee", JSON.stringify(user));
      setEmployee(user);

      // Step 5: Redirect
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <PageLayout showBottomNav={false} showHeader={true}>
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          onClick={handleLogin}
          className={styles.button}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </PageLayout>
  );
};

export default Login;
