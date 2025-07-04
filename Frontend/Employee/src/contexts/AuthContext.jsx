// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mark page refresh before unload
  useEffect(() => {
    const markRefreshing = () => {
      sessionStorage.setItem("refreshing", "true");
    };
    window.addEventListener("beforeunload", markRefreshing);
    return () => window.removeEventListener("beforeunload", markRefreshing);
  }, []);

  // Restore session on load
  useEffect(() => {
    const stored = sessionStorage.getItem("employee");
    if (stored && stored !== "undefined" && stored !== "null") {
      setEmployee(JSON.parse(stored));
    }

    setTimeout(() => {
      sessionStorage.removeItem("refreshing");
    }, 100);

    setLoading(false);
  }, []);

  // Auto-checkout on tab close or page unload
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const emp = sessionStorage.getItem("employee");
      if (emp) {
        try {
          const { _id } = JSON.parse(emp);
          if (_id) {
            const url = `${import.meta.env.VITE_API_BASE}/api/auth/logout/${_id}`;
            const sent = navigator.sendBeacon(url);
            console.log("Logout beacon sent:", sent);
          }
        } catch (err) {
          console.error("Auto-checkout error", err);
        }
        // Don't remove employee here to avoid race condition
      }
      // No need to call event.preventDefault(), just sendBeacon
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Login function
  const login = async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    const employeeData = await res.json();
    setEmployee(employeeData);
    sessionStorage.setItem("employee", JSON.stringify(employeeData));
    return employeeData;
  };

  return (
    <AuthContext.Provider value={{ employee, setEmployee, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
