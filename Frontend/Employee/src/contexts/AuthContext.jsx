import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Store flag when refreshing the tab
  useEffect(() => {
    const markRefreshing = () => {
      sessionStorage.setItem("refreshing", "true");
    };
    window.addEventListener("beforeunload", markRefreshing);
    return () => window.removeEventListener("beforeunload", markRefreshing);
  }, []);

  // 🔃 Load from sessionStorage on initial render
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

  // ❗ Auto logout on tab/browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const isRefreshing = sessionStorage.getItem("refreshing") === "true";
      const emp = sessionStorage.getItem("employee");

      if (!isRefreshing && emp) {
        try {
          const { _id } = JSON.parse(emp);
          if (_id) {
            // ✅ FIXED: Use correct logout route
            const url = `${import.meta.env.VITE_API_BASE}/api/auth/logout/${_id}`;
            const blob = new Blob([JSON.stringify({})], {
              type: "application/json",
            });
            const sent = navigator.sendBeacon(url, blob);

            // Fallback if Beacon fails
            if (!sent) {
              fetch(url, {
                method: "POST",
                body: JSON.stringify({}),
                headers: { "Content-Type": "application/json" },
              });
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

  // 🔐 Login API call
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
