// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Pages & Components
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Leads from "./pages/Leads";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";

const App = () => {
  const { employee, loading } = useAuth();

  // ⏳ Wait for session restore before rendering anything
  if (loading) return null;

  return (
    <Router>
      <Routes>
        {/* 👤 Public Route */}
        <Route path="/login" element={<Login />} />

        {/* 🔁 Root Redirect to Dashboard or Login */}
        <Route
          path="/"
          element={<Navigate to={employee ? "/dashboard" : "/login"} replace />}
        />

        {/* 🔐 Protected Routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Home /></ProtectedRoute>}
        />
        <Route
          path="/leads"
          element={<ProtectedRoute><Leads /></ProtectedRoute>}
        />
        <Route
          path="/schedule"
          element={<ProtectedRoute><Schedule /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />

        {/* 🛑 Catch-All Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
