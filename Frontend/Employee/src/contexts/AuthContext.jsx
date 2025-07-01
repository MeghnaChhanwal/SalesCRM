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

  // 🚪 Auto-logout on tab close
  useEffect(() => {
    const handleTabClose = () => {
      const emp = sessionStorage.getItem("employee");
      if (emp) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_BASE}/api/auth/logout`
        );
        sessionStorage.clear();
      }
    };

    window.addEventListener("unload", handleTabClose);
    return () => window.removeEventListener("unload", handleTabClose);
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

// 🌐 use this in any component to access auth
export const useAuth = () => useContext(AuthContext);
