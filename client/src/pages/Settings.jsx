import React from 'react';
import { THEMES, PIECE_STYLES } from '../utils/themes';

export default function Settings({ theme, setTheme }) {
  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Board Theme</h3>
        <div className="settings-grid">
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key}
              className={`settings-theme-card ${theme === key ? 'selected' : ''}`}
              onClick={() => setTheme(key)}>
              <div className="theme-preview">
                <div className="preview-square" style={{ background: t.light }} />
                <div className="preview-square" style={{ background: t.dark }} />
                <div className="preview-square" style={{ background: t.dark }} />
                <div className="preview-square" style={{ background: t.light }} />
              </div>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>About</h3>
        <div className="about-info">
          <p><strong>UCX Chess Platform</strong> v1.0.0</p>
          <p>A UCX Project founded in 2023 by Kayan Erkama</p>
          <p>Privacy-focused. No ads. No tracking.</p>
        </div>
      </section>
    </div>
  );
}
