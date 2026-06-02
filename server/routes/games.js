const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();
const { JWT_SECRET } = require('../config');

const BOT_ELO = {
  random: 400,
  cautious: 600,
  aggressive: 900,
  positional: 1200,
  tactical: 1500,
  grandmaster: 1800
};

const CALIBRATION_GAMES_NEEDED = 2;

function calculateElo(playerElo, botElo, result, isCalibration) {
  const K = isCalibration ? 64 : 32;
  const expected = 1 / (1 + Math.pow(10, (botElo - playerElo) / 400));
  let score;
  if (result === 'win') score = 1;
  else if (result === 'draw') score = 0.5;
  else score = 0;
  return Math.round(playerElo + K * (score - expected));
}

function getUserFromToken(req) {
  try {
    const token = req.cookies.token;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
  } catch {
    return null;
  }
}

router.post('/result', (req, res) => {
  try {
    const { result, botType, playerColor, pgn, movesCount, anonymousId } = req.body;
    if (!result || !botType) {
      return res.status(400).json({ error: 'Result and botType required' });
    }

    const user = getUserFromToken(req);
    const botElo = BOT_ELO[botType] || 400;
    const gameId = uuidv4();

    if (user) {
      const isCalibration = user.calibration_games < CALIBRATION_GAMES_NEEDED;
      const newElo = calculateElo(user.elo, botElo, result, isCalibration);
      const newCalibration = Math.min(user.calibration_games + 1, CALIBRATION_GAMES_NEEDED);

      const wonInc = result === 'win' ? 1 : 0;
      const drawnInc = result === 'draw' ? 1 : 0;
      const lostInc = result === 'loss' ? 1 : 0;

      db.prepare(`
        UPDATE users SET
          elo = ?, calibration_games = ?,
          games_played = games_played + 1,
          games_won = games_won + ?,
          games_drawn = games_drawn + ?,
          games_lost = games_lost + ?
        WHERE id = ?
      `).run(newElo, newCalibration, wonInc, drawnInc, lostInc, user.id);

      db.prepare(`
        INSERT INTO games (id, user_id, opponent_type, result, player_color, elo_before, elo_after, pgn, moves_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(gameId, user.id, botType, result, playerColor, user.elo, newElo, pgn || '', movesCount || 0);

      const updatedUser = db.prepare('SELECT id, username, elo, calibration_games, games_played, games_won, games_drawn, games_lost, settings FROM users WHERE id = ?').get(user.id);

      res.json({
        gameId,
        eloBefore: user.elo,
        eloAfter: newElo,
        eloChange: newElo - user.elo,
        isCalibration,
        calibrationComplete: newCalibration >= CALIBRATION_GAMES_NEEDED,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          elo: updatedUser.elo,
          calibrationGames: updatedUser.calibration_games,
          gamesPlayed: updatedUser.games_played,
          gamesWon: updatedUser.games_won,
          gamesDrawn: updatedUser.games_drawn,
          gamesLost: updatedUser.games_lost
        }
      });
    } else {
      db.prepare(`
        INSERT INTO games (id, anonymous_id, opponent_type, result, player_color, pgn, moves_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(gameId, anonymousId || 'anon', botType, result, playerColor, pgn || '', movesCount || 0);

      res.json({ gameId, anonymous: true });
    }
  } catch (err) {
    console.error('Game result error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const games = db.prepare('SELECT * FROM games WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(user.id);
    res.json({ games });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
