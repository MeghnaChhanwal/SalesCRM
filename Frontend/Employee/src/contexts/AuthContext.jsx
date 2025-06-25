import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE;

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("employee");

    if (saved) {
      const emp = JSON.parse(saved);
      setEmployee(emp);

      // ✅ Check-in only if login is fresh (not reload)
      const navEntry = performance.getEntriesByType("navigation")[0];
      const isFreshLogin = navEntry?.type === "navigate";

      if (isFreshLogin) {
        axios
          .post(`${API_BASE}/api/timing/check-in/${emp._id}`)
          .catch((err) => console.error("❌ Check-in failed:", err.message));
      }
    }

    // ✅ Final check-out on browser/tab close
    const handleUnload = () => {
      const emp = sessionStorage.getItem("employee");
      if (emp) {
        const parsed = JSON.parse(emp);
        navigator.sendBeacon(`${API_BASE}/api/timing/final-check-out/${parsed._id}`);
        sessionStorage.removeItem("employee");
      }
    };

    window.addEventListener("unload", handleUnload);
    setLoading(false);

    return () => window.removeEventListener("unload", handleUnload);
  }, []);

  return (
    <AuthContext.Provider
      value={{ employee, setEmployee, isLoggedIn: !!employee, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
