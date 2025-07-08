import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Mark refreshing during page reload
  useEffect(() => {
    const markRefreshing = () => {
      sessionStorage.setItem("refreshing", "true");
    };
    window.addEventListener("beforeunload", markRefreshing);
    return () => window.removeEventListener("beforeunload", markRefreshing);
  }, []);

  // 2. Restore session on refresh
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("employee");
      const isRefreshing = sessionStorage.getItem("refreshing") === "true";

      if (stored && stored !== "undefined" && stored !== "null") {
        setEmployee(JSON.parse(stored));
      }

      sessionStorage.removeItem("refreshing"); // Clear flag
    } catch (err) {
      console.error("Session restore error:", err);
      sessionStorage.removeItem("employee");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Auto logout on tab close or refresh
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
          console.error("Logout beacon error:", e);
        }
        sessionStorage.clear();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 4. Manual login function (with check-in)
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

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Login failed");
    }

    const data = await response.json();
    setEmployee(data);
    sessionStorage.setItem("employee", JSON.stringify(data));

    // ✅ Call checkIn API after login (correct route)
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE}/api/timing/${data._id}/checkin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      console.log("✅ Check-in successful");
    } catch (checkInError) {
      console.error("Check-in failed:", checkInError);
    }

    return data;
  };

  // 5. Manual logout
  const logout = async () => {
    try {
      if (employee?._id) {
        await fetch(
          `${import.meta.env.VITE_API_BASE}/api/auth/logout/${employee._id}`,
          {
            method: "POST",
            credentials: "include",
          }
        );
      }
    } catch (e) {
      console.warn("Logout error", e);
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
