import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <h1 className="hero-title">
          <span className="hero-icon">&#9816;</span>
          UCX Chess Platform
        </h1>
        <p className="hero-subtitle">
          A fast, privacy-focused chess platform with multiple themes, piece styles, and AI opponents.
        </p>
        <p className="hero-founded">Founded in 2023 by Kayan Erkama</p>
        <div className="hero-actions">
          {user ? (
            <Link to="/play" className="btn btn-primary btn-lg">Play Now</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
            </>
          )}
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">&#9816;</div>
          <h3>6 AI Opponents</h3>
          <p>From beginner-friendly random moves to deep-calculating grandmaster bots.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#127912;</div>
          <h3>8 Themes</h3>
          <p>Classic, Dark, Forest, Ocean, Sunset, Midnight, Rose, and Ice themes.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#128274;</div>
          <h3>Privacy First</h3>
          <p>No ads. No tracking. Encrypted credentials. Your data stays yours.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#9889;</div>
          <h3>Lightning Fast</h3>
          <p>Optimized for speed with minimal latency and instant responses.</p>
        </div>
      </section>

      <section className="ucx-section">
        <h2>A UCX Project</h2>
        <p>
          UCX Chess Platform is proudly built as part of the UCX initiative, founded in 2023 by Kayan Erkama. 
          We believe in creating open, privacy-respecting software that puts users first.
        </p>
      </section>
    </div>
  );
}
