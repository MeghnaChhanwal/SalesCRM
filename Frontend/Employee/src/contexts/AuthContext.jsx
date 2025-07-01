import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true); // ⏳ Wait before routing

  // 🔁 Restore session on app load
  useEffect(() => {
    const storedEmployee = sessionStorage.getItem("employee");
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    }
    setLoading(false);
  }, []);

  // 🚪 Auto-logout on tab close or visibility change (modern + no warnings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const emp = sessionStorage.getItem("employee");
        if (emp) {
          navigator.sendBeacon(
            `${import.meta.env.VITE_API_BASE}/api/auth/logout`
          );
          sessionStorage.clear();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    const data = await response.json();

    setEmployee(data.employee);
    sessionStorage.setItem("employee", JSON.stringify(data.employee));
    return data.employee;
  };

  // 🚪 Logout function
  const logout = async () => {
    await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    sessionStorage.clear();
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ employee, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🌐 Hook to use in any component
export const useAuth = () => useContext(AuthContext);
