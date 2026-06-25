const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();
const { JWT_SECRET, TOKEN_EXPIRY } = require('../config');

// Base32 encoding for login tokens (32-bit encoded)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Encode data to Base32
function base32Encode(data) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < data.length; i++) {
    value = (value << 8) | data[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

// Generate a 32-bit encoded token for additional security
function generateSecureToken(userId, username) {
  const timestamp = Date.now();
  const data = Buffer.from(`${userId}:${username}:${timestamp}`);
  const hash = crypto.createHash('sha256').update(data).digest();
  const token32 = base32Encode(hash.slice(0, 10)); // Use 10 bytes = 80 bits ≈ 16 Base32 chars
  return `${token32}:${timestamp}`;
}

// Verify 32-bit encoded token
function verifySecureToken(token, userId, username) {
  try {
    const [token32, timestamp] = token.split(':');
    const age = Date.now() - parseInt(timestamp, 10);
    // Token valid for 24 hours
    if (age > 24 * 60 * 60 * 1000) return false;
    
    const data = Buffer.from(`${userId}:${username}:${timestamp}`);
    const hash = crypto.createHash('sha256').update(data).digest();
    const expected = base32Encode(hash.slice(0, 10));
    return token32 === expected;
  } catch {
    return false;
  }
}

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
    const secureToken = generateSecureToken(id, username);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const user = db.prepare('SELECT id, username, elo, calibration_games, games_played, games_won, games_drawn, games_lost, settings FROM users WHERE id = ?').get(id);
    res.json({ user: formatUser(user), secureToken });
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
    const secureToken = generateSecureToken(user.id, user.username);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ user: formatUser(user), secureToken });
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

// Get WebSocket token (32-bit encoded)
router.get('/ws-token', (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const wsToken = generateSecureToken(user.id, user.username);
    res.json({ wsToken });
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
