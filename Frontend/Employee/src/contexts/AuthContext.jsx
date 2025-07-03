import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 1. Mark tab as refreshing BEFORE reload
  useEffect(() => {
    const markRefreshing = () => {
      sessionStorage.setItem("refreshing", "true");
    };
    window.addEventListener("beforeunload", markRefreshing);
    return () => window.removeEventListener("beforeunload", markRefreshing);
  }, []);

  // ✅ 2. Restore session on load (with slight delay for safety)
  useEffect(() => {
    const isRefreshing = sessionStorage.getItem("refreshing") === "true";
    const stored = sessionStorage.getItem("employee");

    if (stored && stored !== "undefined" && stored !== "null") {
      setEmployee(JSON.parse(stored));
    }

    setTimeout(() => {
      sessionStorage.removeItem("refreshing"); // ⏱️ delayed clear
    }, 100); // allows visibility event to detect it safely

    setLoading(false);
  }, []);

  // ✅ 3. Trigger logout only on actual tab close (not refresh)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isRefreshing = sessionStorage.getItem("refreshing") === "true";
      const emp = sessionStorage.getItem("employee");

      // 🚫 Don't logout if refreshing
      if (document.visibilityState === "hidden" && !isRefreshing && emp) {
        try {
          const { _id } = JSON.parse(emp);
          if (_id) {
            navigator.sendBeacon(
              `${import.meta.env.VITE_API_BASE}/api/auth/logout/${_id}`
            );
          }
        } catch (e) {
          console.error("❌ Logout beacon error", e);
        }

        sessionStorage.clear(); // ✅ ensure it's cleared on tab close
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ✅ 4. Login function
  const login = async (email, password) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();
    setEmployee(data.employee);
    sessionStorage.setItem("employee", JSON.stringify(data.employee));
    return data.employee;
  };

  return (
    <AuthContext.Provider value={{ employee, setEmployee, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
