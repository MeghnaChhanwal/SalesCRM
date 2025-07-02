import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { employee, loading } = useAuth();

  if (loading) return null; // ⏳ Wait until session restored

  if (!employee) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
