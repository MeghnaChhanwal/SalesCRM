import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 1. Restore session on page load
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("employee");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed._id) {
          setEmployee(parsed);
        } else {
          sessionStorage.removeItem("employee");
        }
      }
    } catch (err) {
      console.error("Session restore error:", err);
      sessionStorage.removeItem("employee");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 2. Logout + Checkout only on tab close (not refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const emp = sessionStorage.getItem("employee");

      // Detect reload vs close using both legacy and modern APIs
      const navEntry = performance.getEntriesByType("navigation")[0];
      const isReload =
        (performance.navigation && performance.navigation.type === 1) ||
        navEntry?.type === "reload";

      if (!isReload && emp) {
        try {
          const { _id } = JSON.parse(emp);
          if (_id) {
            navigator.sendBeacon(`${import.meta.env.VITE_API_BASE}/api/auth/logout/${_id}`);
            navigator.sendBeacon(`${import.meta.env.VITE_API_BASE}/api/timing/${_id}/checkout`);
          }
        } catch (e) {
          console.error("Beacon error:", e);
        }

        sessionStorage.clear();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ✅ 3. Login + Check-in logic
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

    // Check-in call
    try {
      await fetch(`${import.meta.env.VITE_API_BASE}/api/timing/${data._id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      console.log("✅ Check-in successful");
    } catch (err) {
      console.error("Check-in failed:", err);
    }

    return data;
  };

  return (
    <AuthContext.Provider value={{ employee, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
