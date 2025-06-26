import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE;

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(() => {
    const saved = sessionStorage.getItem("employee");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false); // Session loaded, allow app to render
  }, []);

  // ✅ Tab close only (not on reload)
  useEffect(() => {
    const handleTabClose = () => {
      const navEntry = performance.getEntriesByType("navigation")[0];
      const navType = navEntry?.type;

      if (navType === "reload") return; // Ignore reload

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
    setEmployee(emp);
  };

  const logout = () => {
    sessionStorage.removeItem("employee");
    setEmployee(null);
  };

  return (
    <AuthContext.Provider
      value={{ employee, setEmployee: login, logout, isLoggedIn: !!employee, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
