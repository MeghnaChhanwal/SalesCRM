import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE;

export const AuthProvider = ({ children }) => {
  const [employee, setEmployeeState] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 1. Load employee from sessionStorage on first mount
  useEffect(() => {
    const saved = sessionStorage.getItem("employee");
    if (saved) {
      setEmployeeState(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // ✅ 2. Handle tab close → logout via Beacon or fallback fetch
  useEffect(() => {
    const handleTabClose = () => {
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav?.type === "reload") return;

      const emp = sessionStorage.getItem("employee");
      if (!emp) return;

      const { _id } = JSON.parse(emp);
      const logoutUrl = `${API_BASE}/api/auth/logout/${_id}`;

      const success = navigator.sendBeacon(logoutUrl);

      if (!success) {
        fetch(logoutUrl, {
          method: "POST",
          keepalive: true,
        });
      }

      sessionStorage.removeItem("employee");
    };

    window.addEventListener("pagehide", handleTabClose);
    return () => window.removeEventListener("pagehide", handleTabClose);
  }, []);

  // ✅ 3. Login function (save to session)
  const login = (emp) => {
    sessionStorage.setItem("employee", JSON.stringify(emp));
    setEmployeeState(emp);
  };

  // ✅ 4. Logout function
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
