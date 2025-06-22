import React, { useState, useEffect } from 'react';
import { UserCheck, X, User as UserIcon } from 'lucide-react';
import './FollowRequestsPage.css';

const FollowRequestsPage = () => {
  const [followRequests, setFollowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchFollowRequests();
  }, []);

  const fetchFollowRequests = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/users/me/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Follow requests response:', data); // Debug log
        setFollowRequests(data.requests || []);
      } else {
        console.error('Failed to fetch follow requests');
      }
    } catch (error) {
      console.error('Failed to fetch follow requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowRequestAction = async (requestId, action) => {
    setActionLoading(prev => ({ ...prev, [requestId]: action }));
    
    try {
      const token = sessionStorage.getItem('token');
      // Backend uses 'reject' instead of 'decline'
      const endpoint = action === 'decline' ? 'reject' : action;
      const response = await fetch(`/api/users/me/requests/${requestId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove the request from the list after action
        setFollowRequests(prev => prev.filter(req => (req.id || req._id) !== requestId));
        
        // Dispatch event to refresh navigation notification count
        window.dispatchEvent(new CustomEvent('followStatusChanged'));
      } else {
        console.error(`Failed to ${action} follow request`);
      }
    } catch (error) {
      console.error(`Failed to ${action} follow request:`, error);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  if (loading) {
    return (
      <div className="follow-requests-page">
        <div className="loading">Loading follow requests...</div>
      </div>
    );
  }

  return (
    <div className="follow-requests-page">
      <div className="requests-container">
        <h1>Follow Requests</h1>
        
        {followRequests.length === 0 ? (
          <div className="empty-state">
            <UserIcon size={48} className="empty-icon" />
            <h3>No pending requests</h3>
            <p>You don't have any pending follow requests at the moment.</p>
          </div>
        ) : (
          <div className="requests-list">
            {followRequests.map((request) => {
              // The API returns the user info in 'user' field, not 'from'
              const fromUser = request.user || {};
              const userName = fromUser.username || 'Unknown User';
              const fullName = fromUser.fullName || userName;
              const avatar = fromUser.avatar;
              
              return (
                <div key={request.id || request._id} className="request-card">
                  <div className="request-user">
                    <div className="user-avatar">
                      {avatar ? (
                        <img src={avatar} alt={userName} />
                      ) : (
                        <UserIcon size={24} />
                      )}
                    </div>
                    
                    <div className="user-info">
                      <h3>{fullName}</h3>
                      <p>@{userName}</p>
                      <span className="request-date">
                        Requested {new Date(request.requestedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="request-actions">
                    <button
                      className="accept-btn"
                      onClick={() => handleFollowRequestAction(request.id || request._id, 'accept')}
                      disabled={actionLoading[request.id || request._id]}
                    >
                      {actionLoading[request.id || request._id] === 'accept' ? (
                        <span>Accepting...</span>
                      ) : (
                        <>
                          <UserCheck size={16} />
                          <span>Accept</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      className="decline-btn"
                      onClick={() => handleFollowRequestAction(request.id || request._id, 'decline')}
                      disabled={actionLoading[request.id || request._id]}
                    >
                      {actionLoading[request.id || request._id] === 'decline' ? (
                        <span>Declining...</span>
                      ) : (
                        <>
                          <X size={16} />
                          <span>Decline</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowRequestsPage;
