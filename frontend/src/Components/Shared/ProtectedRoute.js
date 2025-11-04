import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute - Enforces role-based access control
 * @param {string[]} allowedRoles - Array of roles that can access this route
 * @param {React.Component} children - Component to render if authorized
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  // Not logged in -> redirect to login
  if (!token || !user.role) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role -> redirect to their own dashboard
  if (!allowedRoles.includes(user.role)) {
    const roleDashMap = {
      superadmin: "/superadmin/dash",
      admin: "/admin/dash",
      alumni: "/alumini/dash",
      student: "/student/dash",
    };
    return <Navigate to={roleDashMap[user.role] || "/login"} replace />;
  }

  // Authorized -> render the component
  return children;
};

export default ProtectedRoute;
