import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { USER_ROLES } from '../constants';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    console.log('ProtectedRoute: No token or user data found');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const user = JSON.parse(userStr);
    
    if (decodedToken.exp < currentTime) {
      console.log('ProtectedRoute: Token expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }

    const userRole = user.role;
    console.log('ProtectedRoute: User role:', userRole, 'Allowed roles:', allowedRoles);
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      console.log('ProtectedRoute: Unauthorized role');
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  } catch (error) {
    console.error('ProtectedRoute: Error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
