import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User as UserIcon, Check } from 'lucide-react';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/users/me/notifications?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`/api/users/me/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Trigger navigation refresh for notification count
      window.dispatchEvent(new CustomEvent('notificationRead'));
      
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await fetch('/api/users/me/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          isRead: true, 
          readAt: new Date() 
        }))
      );
      
      setUnreadCount(0);
      
      // Trigger navigation refresh for notification count
      window.dispatchEvent(new CustomEvent('notificationRead'));
      
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate to the sender's profile using the correct route
    if (notification.sender && notification.sender.username) {
      navigate(`/profile/${notification.sender.username}`);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow_accepted':
        return <Check size={20} className="notification-icon-follow" />;
      default:
        return <Bell size={20} className="notification-icon-default" />;
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="page-header">
          <h1>Notifications</h1>
        </div>
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-count">{unreadCount} unread</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="mark-all-read-btn"
          >
            Mark All Read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} className="empty-icon" />
            <h3>No notifications</h3>
            <p>When someone accepts your follow request, you'll see it here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-avatar">
                {notification.sender?.avatar ? (
                  <img 
                    src={notification.sender.avatar} 
                    alt={`${notification.sender.username}'s avatar`}
                    className="avatar-img"
                  />
                ) : (
                  <UserIcon size={24} className="avatar-icon" />
                )}
              </div>
              
              <div className="notification-content">
                <div className="notification-main">
                  <div className="notification-text">
                    <span className="sender-name">
                      {notification.sender?.fullName || notification.sender?.username}
                    </span>
                    <span className="notification-message">
                      {notification.type === 'follow_accepted' 
                        ? ' accepted your follow request'
                        : ` ${notification.message.replace(notification.sender?.username || '', '').trim()}`
                      }
                    </span>
                  </div>
                  <div className="notification-time">
                    {formatTime(notification.createdAt)}
                  </div>
                </div>
                
                <div className="notification-meta">
                  <div className="notification-type-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  {!notification.isRead && (
                    <div className="unread-indicator" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
