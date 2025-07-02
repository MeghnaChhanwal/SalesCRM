// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Leads from "./pages/Leads";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";

const App = () => {
  const { employee, loading } = useAuth();

  if (loading) return null; // ⏳ Wait for session restore

  return (
    <Router>
      <Routes>
        {/* 🛠 Root path fix */}
        <Route
          path="/"
          element={
            loading
              ? null
              : employee
              ? <Navigate to="/dashboard" />
              : <Login />
          }
        />

        {/* ✅ Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Fallback: unknown path → dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default App;
