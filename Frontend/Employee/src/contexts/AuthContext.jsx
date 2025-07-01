// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE;

export const AuthProvider = ({ children }) => {
  const [employee, setEmployeeState] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load session from localStorage on app start
  useEffect(() => {
    const saved = localStorage.getItem("employee");
    if (saved) {
      setEmployeeState(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // ✅ Handle logout on tab close
  useEffect(() => {
    const handleTabClose = () => {
      const emp = localStorage.getItem("employee");
      if (!emp) return;

      const { _id } = JSON.parse(emp);
      const logoutUrl = `${API_BASE}/api/auth/logout/${_id}`;

      try {
        navigator.sendBeacon(logoutUrl);
      } catch (_err) {
        fetch(logoutUrl, {
          method: "POST",
          keepalive: true,
        });
      }

      localStorage.removeItem("employee");
    };

    window.addEventListener("beforeunload", handleTabClose);
    return () => window.removeEventListener("beforeunload", handleTabClose);
  }, []);

  // ✅ Login Function
  const login = (emp) => {
    localStorage.setItem("employee", JSON.stringify(emp));
    setEmployeeState(emp);
  };

  // ✅ Logout Function
  const logout = () => {
    localStorage.removeItem("employee");
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

// ✅ Custom hook to use auth
export const useAuth = () => useContext(AuthContext);
