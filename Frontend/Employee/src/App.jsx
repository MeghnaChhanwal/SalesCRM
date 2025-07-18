
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

  
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        Restoring session...
      </div>
    );
  }


  return (
    <Router>
      <Routes>
        <Route path="/" element={employee ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
