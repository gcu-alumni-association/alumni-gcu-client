import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../services/UserContext';

const ProtectedRoute = ({ element, requiredRole }) => {
  const { user, authChecked } = useContext(UserContext);

  // Display a loading message while checking auth status
  if (!authChecked) {
    return <div>Loading...</div>;
  }

  // Check if user is authenticated. replace keeps the Back button from returning here.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the required roles
  if (requiredRole && requiredRole.length > 0 && !requiredRole.includes(user.role)) {
    return <Navigate to="/forbidden" />;
  }

  return element;
};

export default ProtectedRoute;
