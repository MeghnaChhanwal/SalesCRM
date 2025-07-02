import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { employee, loading } = useAuth();

  if (loading) return null; // ⏳ wait until session restored

  // ❌ Not logged in
  if (!employee) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
