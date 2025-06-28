// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE;

export const AuthProvider = ({ children }) => {
  const [employee, setEmployeeState] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Load from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("employee");
    if (saved) {
      setEmployeeState(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // ✅ Auto logout on tab close (but not on refresh)
  useEffect(() => {
    const handleTabClose = () => {
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav?.type === "reload") return;

      const emp = sessionStorage.getItem("employee");
      if (emp && navigator.sendBeacon) {
        const parsed = JSON.parse(emp);
        navigator.sendBeacon(`${API_BASE}/api/auth/logout/${parsed._id}`);
        sessionStorage.removeItem("employee");
      }
    };

    window.addEventListener("pagehide", handleTabClose);
    return () => window.removeEventListener("pagehide", handleTabClose);
  }, []);

  const login = (emp) => {
    sessionStorage.setItem("employee", JSON.stringify(emp));
    setEmployeeState(emp);
  };

  const logout = () => {
    sessionStorage.removeItem("employee");
    setEmployeeState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        employee,
        setEmployee: login,
        logout,
        isLoggedIn: !!employee,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
