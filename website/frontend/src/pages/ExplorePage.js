import React from 'react';
import { Compass, TrendingUp, Users } from 'lucide-react';

const ExplorePage = () => {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Compass size={64} style={{ color: '#667eea', marginBottom: '20px' }} />
        <h1>Explore Content</h1>
        <p style={{ color: '#666', fontSize: '18px', lineHeight: '1.6' }}>
          Discover interesting content from the community. Browse trending summaries, 
          popular users, and find new sources of knowledge.
          Coming soon in the next phase of development!
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginTop: '40px' 
        }}>
          <div style={{ 
            padding: '30px', 
            background: '#f8f9fa', 
            borderRadius: '12px' 
          }}>
            <TrendingUp size={40} style={{ color: '#667eea', marginBottom: '15px' }} />
            <h3>Trending Content</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              See what's popular in the community right now
            </p>
          </div>
          <div style={{ 
            padding: '30px', 
            background: '#f8f9fa', 
            borderRadius: '12px' 
          }}>
            <Users size={40} style={{ color: '#667eea', marginBottom: '15px' }} />
            <h3>Top Users</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Follow the most active content curators
            </p>
          </div>
          <div style={{ 
            padding: '30px', 
            background: '#f8f9fa', 
            borderRadius: '12px' 
          }}>
            <Compass size={40} style={{ color: '#667eea', marginBottom: '15px' }} />
            <h3>Categories</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Browse content by topics and interests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
