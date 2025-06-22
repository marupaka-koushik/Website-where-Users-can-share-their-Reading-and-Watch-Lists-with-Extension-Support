import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, BookOpen, UserPlus, UserCheck, Clock, Calendar, Link as LinkIcon } from 'lucide-react';

const UserProfilePage = () => {
  const { username, targetUsername } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // Determine which username to use - targetUsername for /profile/:targetUsername route, 
  // or username for /u/:username/profile route (viewing own profile)
  const profileUsername = targetUsername || username;

  useEffect(() => {
    const fetchData = async () => {
      if (!profileUsername) {
        console.log('❌ No profileUsername found:', { username, targetUsername, profileUsername });
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching profile for:', profileUsername);
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        
        // Fetch user profile
        console.log('📡 Making API call to:', `/api/users/${profileUsername}`);
        const profileResponse = await fetch(`/api/users/${profileUsername}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        console.log('📊 Profile response status:', profileResponse.status);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Profile data received:', profileData);
          setProfile(profileData.user);
        } else {
          console.error('❌ Profile fetch failed:', profileResponse.status);
        }

        // Fetch user content
        console.log('📡 Making API call to:', `/api/users/${profileUsername}/content`);
        const contentResponse = await fetch(`/api/users/${profileUsername}/content`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        console.log('📊 Content response status:', contentResponse.status);
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          console.log('✅ Content data received:', contentData);
          setContent(contentData.content);
        } else {
          console.error('❌ Content fetch failed:', contentResponse.status);
        }
      } catch (error) {
        console.error('💥 Failed to fetch user data:', error);
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    };

    fetchData();
  }, [profileUsername, username, targetUsername]);

  const handleFollowToggle = async () => {
    if (!currentUser || followLoading) {
      console.log('🚫 Follow toggle blocked:', { currentUser: !!currentUser, followLoading });
      if (!currentUser) {
        alert('Please log in to follow users');
      }
      return;
    }

    console.log('🔘 Follow toggle clicked for:', profileUsername);
    console.log('🔍 Current profile status:', { 
      isFollowing: profile.isFollowing, 
      hasPendingRequest: profile.hasPendingRequest 
    });

    setFollowLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found');
        alert('Please log in to follow users');
        setFollowLoading(false);
        return;
      }

      const endpoint = profile.isFollowing 
        ? `/api/users/${profileUsername}/unfollow`
        : `/api/users/${profileUsername}/follow`;

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
        
        // Update follow status immediately
        setProfile(prev => {
          const updated = {
            ...prev,
            isFollowing: data.status === 'following',
            hasPendingRequest: data.status === 'pending'
          };
          console.log('🔄 Updated profile status:', { 
            isFollowing: updated.isFollowing, 
            hasPendingRequest: updated.hasPendingRequest 
          });
          return updated;
        });

        // Dispatch event to refresh navigation notification count
        window.dispatchEvent(new CustomEvent('followStatusChanged'));

        // Refresh the current user's auth data to get updated following/followers lists
        await refreshUser();

        // Show success message
        const actionText = data.status === 'following' ? 'Now following' : 
                          data.status === 'pending' ? 'Follow request sent' : 'Unfollowed';
        console.log(`🎉 ${actionText} ${profileUsername}`);

        // Small delay to ensure backend is updated
        await new Promise(resolve => setTimeout(resolve, 100));

        // Always refresh the entire profile after any follow/unfollow action
        // to get updated canViewContent, follower counts, and content
        
        // Small delay to ensure backend is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Refresh profile data
        const profileResponse = await fetch(`/api/users/${profileUsername}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData.user);
        }

        // Refresh content data
        const contentResponse = await fetch(`/api/users/${profileUsername}/content`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setContent(contentData.content);
        }
      } else {
        console.error('❌ Follow/unfollow request failed:', response.status, response.statusText);
        
        // Try to get error details
        const errorText = await response.text();
        console.error('❌ Error details:', errorText);
        
        // Show user-friendly error message
        alert(`Failed to ${profile.isFollowing ? 'unfollow' : 'follow'} user. Please try again.`);
      }
    } catch (error) {
      console.error('❌ Follow toggle failed:', error);
      alert('Network error occurred. Please check your connection and try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const getFollowButtonContent = () => {
    if (!profile) return null;
    
    if (profile.isFollowing) {
      return {
        icon: <UserCheck size={16} />,
        text: 'Following',
        className: 'follow-btn following'
      };
    }
    
    if (profile.hasPendingRequest) {
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        color: '#64748b'
      }}>
        <User size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h2>User Not Found</h2>
        <p>Sorry, we couldn't find the user you're looking for.</p>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === profileUsername;
  const followButton = !isOwnProfile ? getFollowButtonContent() : null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '2rem 0' 
    }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '0 1rem' 
      }}>
        {/* Profile Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: profile.avatar ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{
                  color: 'white',
                  fontSize: '3rem',
                  fontWeight: '600'
                }}>
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: '0 0 0.5rem 0', 
                color: '#1e293b',
                fontSize: '2rem',
                fontWeight: '700'
              }}>
                {profile.fullName || profile.username}
              </h1>
              <p style={{ 
                color: '#64748b', 
                margin: '0 0 1rem 0',
                fontSize: '1.1rem' 
              }}>
                @{profile.username}
              </p>
              
              <div style={{ 
                display: 'flex', 
                gap: '2rem', 
                marginBottom: '1rem',
                fontSize: '0.9rem',
                color: '#64748b'
              }}>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem' 
                }}>
                  <BookOpen size={14} />
                  <strong>{profile.stats?.totalContent || 0}</strong> posts
                </span>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem' 
                }}>
                  <Calendar size={14} />
                  Joined {new Date(profile.joinedAt).toLocaleDateString()}
                </span>
              </div>

              {followButton && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '500',
                    cursor: followLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    background: followButton.className.includes('following') ? '#10b981' : 
                               followButton.className.includes('pending') ? '#f59e0b' : '#3b82f6',
                    color: 'white',
                    opacity: followLoading ? 0.7 : 1
                  }}
                >
                  {followButton.icon}
                  {followLoading ? 'Loading...' : followButton.text}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            color: '#1e293b',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            {isOwnProfile ? 'Your Content' : `${profile.username}'s Content`}
          </h2>

          {!profile.canViewContent ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#64748b'
            }}>
              <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ color: '#374151' }}>Private Profile</h3>
              <p>This user's content is private. Follow them to see their posts.</p>
            </div>
          ) : content.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#64748b'
            }}>
              <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ color: '#374151' }}>No Content Yet</h3>
              <p>{isOwnProfile ? "You haven't saved any content yet." : "This user hasn't shared any content yet."}</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gap: '1rem' 
            }}>
              {content.map((item) => (
                <div key={item._id} style={{
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0',
                    color: '#1e293b',
                    fontSize: '1.2rem'
                  }}>
                    {item.title}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.85rem',
                    color: '#64748b',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem' 
                    }}>
                      <LinkIcon size={12} />
                      {item.siteName}
                    </span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  {item.summary && (
                    <p style={{
                      color: '#475569',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {item.summary.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
