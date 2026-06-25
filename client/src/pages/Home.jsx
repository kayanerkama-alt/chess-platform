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
          A fast, privacy-focused chess platform with multiple themes, piece styles, AI opponents, multiplayer, and puzzle training.
        </p>
        <p className="hero-founded">Founded in 2023 by Kayan Erkama</p>
        <div className="hero-actions">
          {user ? (
            <>
              <Link to="/play" className="btn btn-primary btn-lg">Play Now</Link>
              <Link to="/puzzle" className="btn btn-outline btn-lg">Puzzles</Link>
              <div className="hero-elo">
                <span className="elo-badge">ELO: {user.elo}</span>
                {user.calibrationGames < 2 && (
                  <span className="calibration-badge">Calibrating ({user.calibrationGames}/2)</span>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/play" className="btn btn-primary btn-lg">Play as Guest</Link>
              <Link to="/register" className="btn btn-outline btn-lg">Create Account</Link>
            </>
          )}
        </div>
        {!user && (
          <p className="hero-guest-note">No account needed to play! Sign up to track your ELO rating and game history.</p>
        )}
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">&#9816;</div>
          <h3>6 AI Opponents</h3>
          <p>From beginner-friendly random moves to deep-calculating grandmaster bots.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#127912;</div>
          <h3>12 Themes</h3>
          <p>Classic, Dark, Forest, Ocean, Sunset, Midnight, Rose, Ice, Purple Haze, Copper, Emerald, and Noir.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#128274;</div>
          <h3>Privacy First</h3>
          <p>No ads. No tracking. Encrypted credentials with Base32 tokens. Your data stays yours.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#128101;</div>
          <h3>Multiplayer</h3>
          <p>Play real-time games against other players via WebSocket connections.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#129504;</div>
          <h3>Puzzle Training</h3>
          <p>Sharpen your tactics with interactive puzzles and track your progress.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#128200;</div>
          <h3>Game Analysis</h3>
          <p>Real-time position evaluation and move quality assessment like chess.com.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#127942;</div>
          <h3>ELO Rating</h3>
          <p>Play 2 calibration games to determine your starting level, then track your rating.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#128266;</div>
          <h3>Sound Effects</h3>
          <p>Audio feedback for moves, captures, check, and checkmate.</p>
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
