import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps routes that require a specific role.
 * Must be nested inside <ProtectedRoute> (user must already be authenticated).
 * Redirects to /dashboard with a "forbidden" indicator if role doesn't match.
 */
const RoleRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" state={{ forbidden: true }} replace />;
  }

  return children;
};

export default RoleRoute;
