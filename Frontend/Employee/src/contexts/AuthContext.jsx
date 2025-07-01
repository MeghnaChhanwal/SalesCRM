import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE;

export const AuthProvider = ({ children }) => {
  const [employee, setEmployeeState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("employee");
    if (saved) {
      setEmployeeState(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // Logout on tab close
  useEffect(() => {
    let unloaded = false;
    const handleTabClose = () => {
      if (unloaded) return;
      unloaded = true;

      const emp = localStorage.getItem("employee");
      if (!emp) return;

      const { _id } = JSON.parse(emp);
      const logoutUrl = `${API_BASE}/api/auth/logout/${_id}`;

      try {
        navigator.sendBeacon(logoutUrl);
      } catch (err) {
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

  const login = (emp) => {
    localStorage.setItem("employee", JSON.stringify(emp));
    setEmployeeState(emp);
  };

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

export const useAuth = () => useContext(AuthContext);
