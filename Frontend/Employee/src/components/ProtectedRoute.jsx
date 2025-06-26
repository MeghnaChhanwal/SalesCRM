import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null; // while loading context
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
