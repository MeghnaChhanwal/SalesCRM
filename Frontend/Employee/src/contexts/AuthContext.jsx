// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Mark tab as refreshing before reload
  useEffect(() => {
    const markRefreshing = () => {
      sessionStorage.setItem("refreshing", "true");
    };
    window.addEventListener("beforeunload", markRefreshing);
    return () => window.removeEventListener("beforeunload", markRefreshing);
  }, []);

  // ✅ Restore session from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("employee");
    if (stored && stored !== "undefined" && stored !== "null") {
      setEmployee(JSON.parse(stored));
    }

    setTimeout(() => {
      sessionStorage.removeItem("refreshing");
    }, 100);

    setLoading(false);
  }, []);

  // ✅ Trigger auto-checkout on real tab close
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isRefreshing = sessionStorage.getItem("refreshing") === "true";
      const emp = sessionStorage.getItem("employee");

      if (document.visibilityState === "hidden" && !isRefreshing && emp) {
        try {
          const { _id } = JSON.parse(emp);
          if (_id) {
            navigator.sendBeacon(
              `${import.meta.env.VITE_API_BASE}/api/timing/auto-checkout/${_id}`
            );
          }
        } catch (e) {
          console.error("❌ Auto-checkout beacon error", e);
        }

        sessionStorage.clear(); // Clear session only on close
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ✅ Login handler
  const login = async (email, password) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();
    setEmployee(data.employee);
    sessionStorage.setItem("employee", JSON.stringify(data.employee));
    return data.employee;
  };

  return (
    <AuthContext.Provider value={{ employee, setEmployee, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
