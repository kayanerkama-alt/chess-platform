import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { THEMES } from './utils/themes';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Play from './pages/Play';
import Login from './pages/Login';
import Register from './pages/Register';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Settings from './pages/Settings';
import History from './pages/History';
import PuzzleTraining from './components/PuzzleTraining';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('chess-theme');
    if (saved && THEMES[saved]) setTheme(saved);
  }, []);

  useEffect(() => {
    const t = THEMES[theme];
    const root = document.documentElement;
    root.style.setProperty('--bg', t.bg);
    root.style.setProperty('--text', t.text);
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--panel', t.panel);
    root.style.setProperty('--border', t.border);
    root.style.setProperty('--light-sq', t.light);
    root.style.setProperty('--dark-sq', t.dark);
    root.style.setProperty('--highlight', t.highlight);
    root.style.setProperty('--move-highlight', t.moveHighlight);
    localStorage.setItem('chess-theme', theme);
  }, [theme]);

  return (
    <div className="app">
      <Navbar theme={theme} setTheme={setTheme} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play theme={theme} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/settings" element={<ProtectedRoute><Settings theme={theme} setTheme={setTheme} /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/puzzle" element={<PuzzleTraining theme={theme} />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2023-{new Date().getFullYear()} UCX Project &middot; Founded by Kayan Erkama</p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
