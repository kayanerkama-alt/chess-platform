const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();
const { JWT_SECRET, TOKEN_EXPIRY } = require('../config');

router.post('/register', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be 3-30 characters' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 12);
    db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)').run(id, username, hash);

    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const user = db.prepare('SELECT id, username, elo, calibration_games, games_played, games_won, games_drawn, games_lost, settings FROM users WHERE id = ?').get(id);
    res.json({ user: formatUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ user: formatUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username, elo, calibration_games, games_played, games_won, games_drawn, games_lost, settings FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.put('/settings', (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { settings } = req.body;
    db.prepare('UPDATE users SET settings = ? WHERE id = ?').run(JSON.stringify(settings), decoded.id);
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

function formatUser(user) {
  return {
    id: user.id,
    username: user.username,
    elo: user.elo,
    calibrationGames: user.calibration_games,
    gamesPlayed: user.games_played,
    gamesWon: user.games_won,
    gamesDrawn: user.games_drawn,
    gamesLost: user.games_lost,
    settings: JSON.parse(user.settings || '{}')
  };
}

module.exports = router;
