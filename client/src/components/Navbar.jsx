import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { THEMES } from '../utils/themes';

export default function Navbar({ theme, setTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showThemes, setShowThemes] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span className="nav-icon">&#9816;</span>
        <span>UCX Chess</span>
      </Link>
      <div className="nav-links">
        <Link to="/play" className="nav-link">Play</Link>
        <div className="theme-dropdown">
          <button className="nav-link theme-btn" onClick={() => setShowThemes(!showThemes)}>
            Theme
          </button>
          {showThemes && (
            <div className="theme-menu">
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} className={`theme-option ${theme === key ? 'active' : ''}`}
                  onClick={() => { setTheme(key); setShowThemes(false); }}
                  style={{ borderLeft: `4px solid ${t.accent}` }}>
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {user ? (
          <>
            <Link to="/history" className="nav-link">History</Link>
            <Link to="/settings" className="nav-link">Settings</Link>
            <span className="nav-user">{user.username}</span>
            <button className="nav-link logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link btn-accent">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
