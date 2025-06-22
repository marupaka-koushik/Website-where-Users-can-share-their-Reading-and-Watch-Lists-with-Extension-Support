import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserRoutes } from '../hooks/useUserRoutes';
import { User, LogOut, Home, Compass, BarChart3, Search, Bell } from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const routes = useUserRoutes();
  const navigate = useNavigate();
  const [notificationsCount, setNotificationsCount] = useState(0);

  // Fetch notifications count
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationsCount();
    }
  }, [isAuthenticated]);

  // Listen for notification changes
  useEffect(() => {
    const handleNotificationChange = () => {
      if (isAuthenticated) {
        fetchNotificationsCount();
      }
    };

    window.addEventListener('followStatusChanged', handleNotificationChange);
    window.addEventListener('notificationRead', handleNotificationChange);
    return () => {
      window.removeEventListener('followStatusChanged', handleNotificationChange);
      window.removeEventListener('notificationRead', handleNotificationChange);
    };
  }, [isAuthenticated]);

  const fetchNotificationsCount = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/users/me/notifications?limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationsCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <BarChart3 size={24} />
          <span>Content Summarizer</span>
        </Link>
        
        <div className="nav-links">
          {!isAuthenticated && (
            <>
              <Link to="/" className="nav-link">
                <Home size={18} />
                <span>Home</span>
              </Link>
              
              <Link to="/explore" className="nav-link">
                <Compass size={18} />
                <span>Explore</span>
              </Link>
            </>
          )}
          
          {isAuthenticated ? (
            <>
              <Link to={routes.search} className="nav-link">
                <Search size={18} />
                <span>Search</span>
              </Link>
              
              <Link to={routes.notifications} className="nav-link">
                <Bell size={18} />
                <span>Notifications</span>
                {notificationsCount > 0 && (
                  <span className="notification-badge">{notificationsCount}</span>
                )}
              </Link>
              
              <Link to={routes.dashboard} className="nav-link">
                <User size={18} />
                <span>Dashboard</span>
              </Link>
              
              <div className="nav-user">
                <span className="nav-username">Hi, {user?.username}</span>
                <button onClick={handleLogout} className="nav-logout">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-link-auth">Login</Link>
              <Link to="/register" className="nav-link-auth nav-link-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
