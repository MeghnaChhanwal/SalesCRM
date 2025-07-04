import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Mark refresh (when reloading, not closing)
  useEffect(() => {
    const markRefreshing = () => {
      sessionStorage.setItem("refreshing", "true");
    };
    window.addEventListener("beforeunload", markRefreshing);
    return () => window.removeEventListener("beforeunload", markRefreshing);
  }, []);

  // ✅ Restore session after refresh
  useEffect(() => {
    const stored = sessionStorage.getItem("employee");
    if (stored && stored !== "undefined" && stored !== "null") {
      setEmployee(JSON.parse(stored));
    }

    // Clear refresh flag
    setTimeout(() => {
      sessionStorage.removeItem("refreshing");
    }, 100);

    setLoading(false);
  }, []);

  // ✅ Auto logout on tab close (not refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const isRefreshing = sessionStorage.getItem("refreshing") === "true";
      const emp = sessionStorage.getItem("employee");

      if (!isRefreshing && emp) {
        try {
          const { _id } = JSON.parse(emp);
          if (_id) {
            const url = `${import.meta.env.VITE_API_BASE}/api/auth/logout/${_id}`;

            // ✅ Send valid POST request with empty JSON body
            const blob = new Blob([JSON.stringify({})], {
              type: "application/json",
            });

            const sent = navigator.sendBeacon(url, blob);

            // Optional fallback if beacon fails
            if (!sent) {
              fetch(url, { method: "POST", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } });
            }
          }
        } catch (err) {
          console.error("Auto-logout error:", err);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ✅ Login handler
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
