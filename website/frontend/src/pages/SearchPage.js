import React, { useState, useEffect } from 'react';
import { Search, UserPlus, UserCheck, Clock, Eye, FileText, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserRoutes } from '../hooks/useUserRoutes';
import './SearchPage.css';

const SearchPage = () => {
  const routes = useUserRoutes();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followRequests, setFollowRequests] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});

  // Fetch pending follow requests
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
        setFollowRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch follow requests:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setFollowingStatus({});
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users);
        
        // Set follow status from search results (no need for individual API calls)
        const statusMap = {};
        data.users.forEach(user => {
          statusMap[user._id] = {
            isFollowing: user.isFollowing,
            hasPendingRequest: user.hasPendingRequest
          };
        });
        setFollowingStatus(statusMap);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (username, userId) => {
    console.log('🔘 Follow toggle clicked:', { username, userId });
    console.log('🔍 Current follow status:', followingStatus[userId]);
    
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found');
        alert('Please log in to follow users');
        return;
      }

      const currentStatus = followingStatus[userId];
      const endpoint = currentStatus?.isFollowing 
        ? `/api/users/${username}/unfollow`
        : `/api/users/${username}/follow`;

      console.log('📡 Making request to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! Response data:', data);
        
        // Update following status immediately for better UX
        setFollowingStatus(prev => {
          const newStatus = {
            ...prev,
            [userId]: {
              isFollowing: data.status === 'following',
              hasPendingRequest: data.status === 'pending'
            }
          };
          console.log('🔄 Updated follow status for user', userId, ':', newStatus[userId]);
          return newStatus;
        });

        // Dispatch event to refresh navigation notification count
        window.dispatchEvent(new CustomEvent('followStatusChanged'));

        // Show success message
        const actionText = data.status === 'following' ? 'Now following' : 
                          data.status === 'pending' ? 'Follow request sent' : 'Unfollowed';
        console.log(`🎉 ${actionText} ${username}`);

      } else {
        console.error('❌ Follow toggle failed with status:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || 'Follow action failed';
        } catch {
          errorMessage = 'Follow action failed';
        }
        
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('💥 Follow toggle failed with error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getFollowButtonContent = (searchUser) => {
    const status = followingStatus[searchUser._id];
    
    if (status?.isFollowing) {
      return {
        icon: <UserCheck size={16} />,
        text: 'Following',
        className: 'follow-btn following'
      };
    }
    
    if (status?.hasPendingRequest) {
      return {
        icon: <Clock size={16} />,
        text: 'Pending',
        className: 'follow-btn pending'
      };
    }
    
    return {
      icon: <UserPlus size={16} />,
      text: 'Follow',
      className: 'follow-btn'
    };
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1>Discover Users</h1>
        
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search for users by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Follow Requests Section */}
        {followRequests.length > 0 && (
          <div className="follow-requests-section">
            <div className="requests-header">
              <h2>You have {followRequests.length} pending follow request{followRequests.length > 1 ? 's' : ''}</h2>
              <Link to={routes.requests} className="view-all-requests">
                <Bell size={16} />
                View All Requests
              </Link>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="search-results">
          {loading && <div className="loading">Searching...</div>}
          
          {!loading && searchQuery.trim() && searchResults.length === 0 && (
            <div className="no-results">
              <Search size={48} />
              <h3>No users found</h3>
              <p>Try searching with different keywords</p>
            </div>
          )}

          {searchResults.map((searchUser) => {
            const followButton = getFollowButtonContent(searchUser);
            
            return (
              <div key={searchUser._id} className="user-card">
                <div className="user-info">
                  <div className="user-avatar">
                    {searchUser.avatar ? (
                      <img src={searchUser.avatar} alt={searchUser.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {searchUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h3>{searchUser.fullName || searchUser.username}</h3>
                    <p className="username">@{searchUser.username}</p>
                    {searchUser.email && (
                      <p className="user-email">{searchUser.email}</p>
                    )}
                    <div className="user-stats">
                      <span className="stat">
                        <FileText size={14} />
                        {searchUser.stats?.totalContent || 0} posts
                      </span>
                    </div>
                  </div>
                </div>
                <div className="user-actions">
                  <button
                    onClick={() => handleFollowToggle(searchUser.username, searchUser._id)}
                    className={followButton.className}
                  >
                    {followButton.icon}
                    {followButton.text}
                  </button>
                  <Link 
                    to={`/profile/${searchUser.username}`}
                    className="view-profile-btn"
                  >
                    <Eye size={16} />
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {!searchQuery.trim() && searchResults.length === 0 && !loading && (
          <div className="search-placeholder">
            <Search size={64} />
            <h2>Find and Connect with Users</h2>
            <p>Search for users by their name or username to discover their content and connect with them.</p>
            <div className="search-tips">
              <h3>Tips:</h3>
              <ul>
                <li>Use at least 2 characters to search</li>
                <li>Search by username or full name</li>
                <li>Follow users to see their content in your feed</li>
                <li>Send follow requests to users with private profiles</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
