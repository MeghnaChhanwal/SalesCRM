import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE;

export const AuthProvider = ({ children }) => {
  const [employee, setEmployeeState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("employee");
    if (saved) {
      setEmployeeState(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // ✅ Tab Close (not refresh) → logout using sendBeacon
  useEffect(() => {
    const handleTabClose = (event) => {
      const emp = sessionStorage.getItem("employee");
      if (!emp) return;

      const { _id } = JSON.parse(emp);
      const logoutUrl = `${API_BASE}/api/auth/logout/${_id}`;

      try {
        // Use Beacon
        navigator.sendBeacon(logoutUrl);
      } catch (err) {
        fetch(logoutUrl, {
          method: "POST",
          keepalive: true,
        });
      }

      sessionStorage.removeItem("employee");
    };

    window.addEventListener("beforeunload", handleTabClose); // Better than pagehide
    return () => window.removeEventListener("beforeunload", handleTabClose);
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
