import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, TrendingUp, Users, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [stats, setStats] = useState({
    totalContent: 0,
    totalSummaries: 0,
    followerCount: 0,
    followingCount: 0
  });
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    // Redirect legacy /dashboard route to user-specific route
    if (location.pathname === '/dashboard' && isAuthenticated && user?.username) {
      navigate(`/u/${user.username}`, { replace: true });
      return;
    }

    // Validate that URL username matches logged-in user (extra security layer)
    if (username && isAuthenticated && user?.username && username !== user.username) {
      navigate(`/u/${user.username}`, { replace: true });
      return;
    }

    const loadDashboardData = async () => {
      if (isAuthenticated) {
        await fetchUserContent();
        await fetchUserStats();
      }
    };
    
    loadDashboardData();
  }, [isAuthenticated, user, navigate, location.pathname, username]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserContent = async () => {
    try {
      const response = await axios.get(`${API_URL}/content`);
      setContent(response.data.content || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Since we have user stats in the user object, we can use those
      if (user) {
        setStats({
          totalContent: user.stats?.totalContent || 0,
          totalSummaries: user.stats?.totalSummaries || 0,
          followerCount: user.followerCount || 0,
          followingCount: user.followingCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = async (contentId) => {
    try {
      const response = await axios.get(`${API_URL}/content/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setSelectedContent(response.data.content);
    } catch (error) {
      console.error('Error fetching content details:', error);
    }
  };

  const closeContentModal = () => {
    setSelectedContent(null);
  };

  const deleteContent = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await axios.delete(`${API_URL}/content/${contentId}`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        
        // Remove the deleted content from state
        setContent(prev => prev.filter(item => item._id !== contentId));
        
        // If the deleted content is currently selected, close the modal
        if (selectedContent?._id === contentId) {
          setSelectedContent(null);
        }
        
        alert('Content deleted successfully');
      } catch (error) {
        console.error('Error deleting content:', error);
        alert('Failed to delete content. Please try again.');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page">
        <div className="auth-required">
          <h2>Please log in to access your dashboard</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome back, {user?.fullName || user?.username}!</h1>
            <p>Here's what's happening with your content</p>
          </div>
          <div className="header-actions">
            <div className="install-extension">
              <Plus size={20} />
              <span>Install Chrome Extension to start adding content</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <BookOpen className="stat-icon" />
            <div className="stat-info">
              <h3>{stats.totalContent}</h3>
              <p>Total Content</p>
            </div>
          </div>
          
          <div className="stat-card">
            <TrendingUp className="stat-icon" />
            <div className="stat-info">
              <h3>{stats.totalSummaries}</h3>
              <p>Summaries Generated</p>
            </div>
          </div>
          
          <div className="stat-card">
            <Users className="stat-icon" />
            <div className="stat-info">
              <h3>{stats.followerCount}</h3>
              <p>Followers</p>
            </div>
          </div>
          
          <div className="stat-card">
            <Users className="stat-icon" />
            <div className="stat-info">
              <h3>{stats.followingCount}</h3>
              <p>Following</p>
            </div>
          </div>
        </div>

        {/* Recent Content */}
        <div className="dashboard-section">
          <h2>Recent Content</h2>
          {content.length > 0 ? (
            <div className="content-grid">
              {content.slice(0, 6).map((item) => (
                <div 
                  key={item._id} 
                  className="content-card" 
                  onClick={() => handleContentClick(item._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="content-header">
                    <div className="content-title-section">
                      <h3>{item.title}</h3>
                      <span className="content-source">{item.siteName}</span>
                    </div>
                    <button 
                      className="content-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteContent(item._id);
                      }}
                      title="Delete content"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="content-preview">
                    {(() => {
                      // Handle summary object vs string
                      if (item.summary) {
                        if (typeof item.summary === 'string') {
                          return <p>{item.summary.substring(0, 150)}...</p>;
                        } else if (item.summary.text) {
                          return <p>{item.summary.text.substring(0, 150)}...</p>;
                        }
                      }
                      // Fallback to content if no valid summary
                      if (item.content && typeof item.content === 'string') {
                        return <p>{item.content.substring(0, 150)}...</p>;
                      }
                      return <p>No preview available</p>;
                    })()}
                  </div>
                  <div className="content-footer">
                    <span className="content-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="content-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Original
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BookOpen size={48} />
              <h3>No content yet</h3>
              <p>Install our Chrome extension and start extracting content from your favorite websites!</p>
            </div>
          )}
        </div>

        {/* Content Modal */}
        {selectedContent && (
          <div className="content-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{selectedContent.title}</h2>
                <div className="modal-header-actions">
                  <button 
                    className="modal-delete-btn"
                    onClick={() => deleteContent(selectedContent._id)}
                    title="Delete content"
                  >
                    <Trash2 size={18} />
                  </button>
                  <span className="close-modal" onClick={closeContentModal}>&times;</span>
                </div>
              </div>
              <div className="modal-body">
                <p className="content-source">{selectedContent.siteName}</p>
                <div className="content-details">
                  {selectedContent.imageUrl && (
                    <img src={selectedContent.imageUrl} alt={selectedContent.title} className="content-image" />
                  )}
                  <div className="content-text">
                    <p className="content-date">
                      {new Date(selectedContent.createdAt).toLocaleDateString()}
                    </p>
                    <div className="content-summary">
                      <div className="summary-header">
                        <h4>AI Summary:</h4>
                      </div>
                      {(() => {
                        // Handle summary object vs string
                        if (selectedContent.summary) {
                          if (typeof selectedContent.summary === 'string') {
                            return <div className="summary-text">{selectedContent.summary}</div>;
                          } else if (selectedContent.summary.text) {
                            return (
                              <div className="summary-text">
                                {selectedContent.summary.text}
                                <div className="summary-meta">
                                  <small>
                                    Generated {selectedContent.summary.generatedAt ? 
                                      new Date(selectedContent.summary.generatedAt).toLocaleString() : 
                                      'recently'
                                    } • Status: {selectedContent.summary.status}
                                  </small>
                                </div>
                              </div>
                            );
                          } else if (selectedContent.summary.status === 'not_requested') {
                            return <div className="no-summary-note">No summary available</div>;
                          }
                        }
                        return <div className="no-summary-note">No summary available</div>;
                      })()}
                    </div>
                    <a 
                      href={selectedContent.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="content-link"
                    >
                      View Full Content
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
