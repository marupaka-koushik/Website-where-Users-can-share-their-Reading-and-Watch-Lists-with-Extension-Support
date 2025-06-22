import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Chrome, Sparkles, Users, BarChart3 } from 'lucide-react';
import './HomePage.css';

// Test: Auto-reload functionality
const HomePage = () => {
  // Note: This page is only accessible to non-authenticated users
  // due to PublicRoute protection
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <Sparkles className="hero-icon" />
            Transform Your Web Content
            <br />
            Into Intelligent Summaries
          </h1>
          <p className="hero-description">
            Extract and summarize content from any website or YouTube video using our Chrome extension. 
            Build your personal knowledge base and discover what others are reading.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <Chrome size={48} className="hero-card-icon" />
            <h3>Chrome Extension</h3>
            <p>One-click content extraction from any webpage</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Everything You Need</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Chrome className="feature-icon" />
              <h3>Universal Extraction</h3>
              <p>Extract content from any website, article, or YouTube video with our intelligent Chrome extension.</p>
            </div>
            
            <div className="feature-card">
              <Sparkles className="feature-icon" />
              <h3>AI Summaries</h3>
              <p>Get intelligent summaries powered by advanced AI to quickly understand the key points.</p>
            </div>
            
            <div className="feature-card">
              <Users className="feature-icon" />
              <h3>Social Discovery</h3>
              <p>Follow other users and discover interesting content they've saved and summarized.</p>
            </div>
            
            <div className="feature-card">
              <BarChart3 className="feature-icon" />
              <h3>Personal Library</h3>
              <p>Build your personal knowledge base with organized content and powerful search.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Install Extension</h3>
              <p>Add our Chrome extension to your browser</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Extract Content</h3>
              <p>Click the extension on any webpage to extract content</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Summary</h3>
              <p>Receive AI-powered summaries of your content</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Share & Discover</h3>
              <p>Build your library and discover others' content</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of users who are already building their knowledge base</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Create Your Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
