import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore session from sessionStorage
  useEffect(() => {
    const storedEmployee = sessionStorage.getItem("employee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    }
    setLoading(false);
  }, []);

  // 🚪 Auto-logout only on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const stored = sessionStorage.getItem("employee");
      if (stored) {
        const { _id } = JSON.parse(stored);
        if (_id) {
          navigator.sendBeacon(
            `${import.meta.env.VITE_API_BASE}/api/auth/logout/${_id}`
          );
        }
        sessionStorage.clear();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 🔐 Login function
  const login = async (email, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Login failed");

    const { employee } = await response.json(); // 🧠 cleaner destructuring
    setEmployee(employee);
    sessionStorage.setItem("employee", JSON.stringify(employee));
    return employee;
  };

  // 🚪 Logout function (manual)
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
