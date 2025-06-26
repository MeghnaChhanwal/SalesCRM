import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE;

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session if employee info is saved
    const saved = sessionStorage.getItem("employee");
    if (saved) {
      const emp = JSON.parse(saved);
      setEmployee(emp);
    }

    // Handler for tab close or page unload
    const handleUnload = () => {
      const navEntry = performance.getEntriesByType("navigation")[0] || {};
      const navType = navEntry.type || "navigate";

      if (navType !== "reload") {
        const emp = sessionStorage.getItem("employee");
        if (emp) {
          const parsed = JSON.parse(emp);
          // Use navigator.sendBeacon for reliable background requests
          navigator.sendBeacon(`${API_BASE}/api/timing/final-check-out/${parsed._id}`);
          navigator.sendBeacon(`${API_BASE}/api/auth/logout/${parsed._id}`);
          sessionStorage.removeItem("employee");
        }
      }
    };

    // ✅ Use pagehide instead of deprecated unload
    window.addEventListener("pagehide", handleUnload);
    setLoading(false);

    // Cleanup
    return () => {
      window.removeEventListener("pagehide", handleUnload);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ employee, setEmployee, isLoggedIn: !!employee, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
