import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, adminOnly = false, employerOnly = false, embassyOnly = false, workerOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  // Role-specific access control
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (employerOnly && user.role !== 'employer') return <Navigate to="/dashboard" replace />;
  if (embassyOnly && user.role !== 'embassy') return <Navigate to="/dashboard" replace />;
  if (workerOnly && user.role !== 'worker') return <Navigate to="/employer/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
