const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'chess.db');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    elo INTEGER DEFAULT 800,
    calibration_games INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_drawn INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT,
    settings TEXT DEFAULT '{}'
  );
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    anonymous_id TEXT,
    opponent_type TEXT NOT NULL,
    result TEXT,
    player_color TEXT,
    elo_before INTEGER,
    elo_after INTEGER,
    pgn TEXT,
    moves_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS encryption_keys (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    key_value TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const existingKey = db.prepare('SELECT key_value FROM encryption_keys WHERE id = 1').get();
if (!existingKey) {
  db.prepare('INSERT INTO encryption_keys (id, key_value) VALUES (1, ?)').run(ENCRYPTION_KEY);
}

function getEncryptionKey() {
  const row = db.prepare('SELECT key_value FROM encryption_keys WHERE id = 1').get();
  return row.key_value;
}

module.exports = db;
module.exports.getEncryptionKey = getEncryptionKey;
