// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/axios"; // axios instance with VITE_API_BASE

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);      // { employeeId, name, status }
  const [timing, setTiming] = useState(null);          // { checkin, breaks }

  // ✅ Login Handler
  const login = async (email, password) => {
    const res = await API.post("/api/auth/login", { email, password });
    const { employeeId, name, checkin, status, break: breaks } = res.data;

    setEmployee({ employeeId, name, status });
    setTiming({ checkin, breaks });
  };

  // ✅ Logout Handler (manual logout button)
  const logout = async () => {
    if (employee?.employeeId) {
      await API.post(`/api/auth/logout/${employee.employeeId}`);
    }
    setEmployee(null);
    setTiming(null);
  };

  // ✅ Beacon API: Logout on tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (employee?.employeeId) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_BASE}/api/timing/checkout/${employee.employeeId}`,
          ""
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [employee]);

  return (
    <AuthContext.Provider value={{ employee, timing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook to access context
export const useAuth = () => useContext(AuthContext);
