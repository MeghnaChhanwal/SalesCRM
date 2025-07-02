import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 1. Mark tab as refreshing
  useEffect(() => {
    const markRefreshing = () => {
      sessionStorage.setItem("refreshing", "true");
    };
    window.addEventListener("beforeunload", markRefreshing);
    return () => {
      window.removeEventListener("beforeunload", markRefreshing);
    };
  }, []);

  // ✅ 2. Restore session on load
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("employee");
      const isRefreshing = sessionStorage.getItem("refreshing") === "true";

      if (stored && stored !== "undefined" && stored !== "null") {
        setEmployee(JSON.parse(stored));
      }

      sessionStorage.removeItem("refreshing"); // Always clear after load
    } catch (err) {
      console.error("❌ Session restore error:", err);
      sessionStorage.removeItem("employee");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 3. Auto logout on tab close (not refresh) using visibilitychange
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isRefreshing = sessionStorage.getItem("refreshing") === "true";
      const emp = sessionStorage.getItem("employee");

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

        sessionStorage.clear();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // ✅ 4. Login (manual)
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
    <AuthContext.Provider value={{ employee, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
