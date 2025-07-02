import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore session safely
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("employee");
      if (stored && stored !== "undefined" && stored !== "null") {
        setEmployee(JSON.parse(stored));
      }
    } catch (err) {
      console.error("❌ Session parse error:", err);
      sessionStorage.removeItem("employee");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚪 Logout on tab close (only when session exists)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const emp = sessionStorage.getItem("employee");
      if (emp) {
        try {
          const { _id } = JSON.parse(emp);
          if (_id) {
            navigator.sendBeacon(
              `${import.meta.env.VITE_API_BASE}/api/auth/logout/${_id}`
            );
          }
        } catch (e) {
          console.error("Logout parse error", e);
        }
        sessionStorage.clear();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 🔐 Login
  const login = async (email, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();
    setEmployee(data.employee);
    sessionStorage.setItem("employee", JSON.stringify(data.employee));
    return data.employee;
  };

  // 🚪 Manual Logout
  const logout = async () => {
    if (employee?._id) {
      await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/logout/${employee._id}`, {
        method: "POST",
        credentials: "include",
      });
    }
    sessionStorage.clear();
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ employee, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
