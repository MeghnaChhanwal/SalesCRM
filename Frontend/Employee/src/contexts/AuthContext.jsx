import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set refresh flag on reload
  useEffect(() => {
    const markRefreshing = () => {
      sessionStorage.setItem("refreshing", "true");
    };
    window.addEventListener("beforeunload", markRefreshing);
    return () => window.removeEventListener("beforeunload", markRefreshing);
  }, []);

  // Restore session after reload
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

  // Auto logout on tab close
  useEffect(() => {
    const handleVisibilityChange = () => {
      const refreshing = sessionStorage.getItem("refreshing") === "true";
      const emp = sessionStorage.getItem("employee");

      if (document.visibilityState === "hidden" && !refreshing && emp) {
        try {
          const { _id } = JSON.parse(emp);
          if (_id) {
            navigator.sendBeacon(`${import.meta.env.VITE_API_BASE}/api/auth/logout/${_id}`);
          }
        } catch (e) {
          console.error("Beacon logout failed:", e);
        }

        sessionStorage.removeItem("employee");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
