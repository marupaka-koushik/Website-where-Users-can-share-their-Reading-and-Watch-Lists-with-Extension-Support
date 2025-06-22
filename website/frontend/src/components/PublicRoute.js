import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#667eea'
      }}>
        Loading...
      </div>
    );
  }

  // If user is authenticated, redirect to their dashboard
  if (isAuthenticated && user?.username) {
    return <Navigate to={`/u/${user.username}`} replace />;
  }

  // If not authenticated, show the public page
  return children;
};

export default PublicRoute;
