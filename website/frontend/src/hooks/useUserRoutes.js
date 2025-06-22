import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to generate user-specific routes
 * This ensures all future features follow the /u/:username/feature pattern
 */
export const useUserRoutes = () => {
  const { user } = useAuth();
  
  const getUserRoute = (feature = '') => {
    if (!user?.username) return '/';
    
    const baseRoute = `/u/${user.username}`;
    return feature ? `${baseRoute}/${feature}` : baseRoute;
  };
  
  return {
    // Core user routes
    dashboard: getUserRoute(),
    search: getUserRoute('search'),
    requests: getUserRoute('requests'),
    notifications: getUserRoute('notifications'),
    profile: getUserRoute('profile'),
    content: getUserRoute('content'),
    
    // Helper function for future features
    getRoute: getUserRoute
  };
};

/**
 * Component for user-specific navigation links
 * Usage: <UserLink to="search">Search Users</UserLink>
 */
export const UserLink = ({ to, children, className, ...props }) => {
  const routes = useUserRoutes();
  const href = routes[to] || routes.getRoute(to);
  
  return (
    <Link to={href} className={className} {...props}>
      {children}
    </Link>
  );
};

export default useUserRoutes;
