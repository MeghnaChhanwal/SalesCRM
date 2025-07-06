// src/pages/Login.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/Layout"; // Layout wrapper
import styles from "../styles/Login.module.css"; // CSS module

const Login = () => {
  const { employee, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (employee) {
      navigate("/dashboard");
    }
  }, [employee, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <PageLayout showHeader={true} showBottomNav={false}>
      <div className={styles.content}>
        <form className={styles.formBox} onSubmit={handleSubmit}>
          <h2>Login</h2>
          {error && <div className={styles.error}>{error}</div>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Last Name (password)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <span
              className={styles.showText}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default Login;
