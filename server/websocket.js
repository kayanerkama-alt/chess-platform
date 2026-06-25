const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { Chess } = require('chess.js');
const { JWT_SECRET } = require('./config');
const db = require('./db');

const wss = new WebSocket.Server({ noServer: true });
const games = new Map();
const players = new Map();
const waitingPlayers = [];

function broadcast(gameId, message, excludeWs = null) {
  const game = games.get(gameId);
  if (!game) return;
  const data = JSON.stringify(message);
  game.players.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
  game.spectators.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

function getUserFromToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
  } catch {
    return null;
  }
}

wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      handleMessage(ws, msg);
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });
});

function handleMessage(ws, msg) {
  switch (msg.type) {
    case 'auth':
      handleAuth(ws, msg.token);
      break;
    case 'find_match':
      handleFindMatch(ws);
      break;
    case 'cancel_match':
      handleCancelMatch(ws);
      break;
    case 'move':
      handleMove(ws, msg);
      break;
    case 'resign':
      handleResign(ws);
      break;
    case 'offer_draw':
      handleOfferDraw(ws);
      break;
    case 'respond_draw':
      handleRespondDraw(ws, msg.accept);
      break;
    case 'get_game':
      handleGetGame(ws, msg.gameId);
      break;
    case 'chat':
      handleChat(ws, msg.message);
      break;
    case 'spectate':
      handleSpectate(ws, msg.gameId);
      break;
  }
}

function handleAuth(ws, token) {
  const user = getUserFromToken(token);
  if (user) {
    ws.user = user;
    ws.send(JSON.stringify({ type: 'auth_success', user: formatUser(user) }));
  } else {
    ws.send(JSON.stringify({ type: 'auth_failed' }));
  }
}

function handleFindMatch(ws) {
  if (!ws.user) {
    ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
    return;
  }

  // Remove from waiting if already there
  const idx = waitingPlayers.indexOf(ws);
  if (idx > -1) waitingPlayers.splice(idx, 1);

  // Check if there's someone waiting
  if (waitingPlayers.length > 0) {
    const opponent = waitingPlayers.shift();
    if (opponent.readyState !== WebSocket.OPEN) {
      handleFindMatch(ws);
      return;
    }
    createGame(ws, opponent);
  } else {
    waitingPlayers.push(ws);
    ws.send(JSON.stringify({ type: 'waiting_for_match' }));
  }
}

function handleCancelMatch(ws) {
  const idx = waitingPlayers.indexOf(ws);
  if (idx > -1) {
    waitingPlayers.splice(idx, 1);
    ws.send(JSON.stringify({ type: 'match_cancelled' }));
  }
}

function createGame(player1, player2) {
  const gameId = 'mp_' + Math.random().toString(36).slice(2, 10);
  const game = new Chess();
  
  const gameData = {
    id: gameId,
    chess: game,
    players: [player1, player2],
    colors: { [player1.user.id]: 'w', [player2.user.id]: 'b' },
    moves: [],
    spectators: [],
    drawOffers: {},
    chat: []
  };
  gameData.drawOffers[player1.user.id] = false;
  gameData.drawOffers[player2.user.id] = false;
  
  games.set(gameId, gameData);
  players.set(player1, gameId);
  players.set(player2, gameId);

  player1.send(JSON.stringify({
    type: 'game_start',
    gameId,
    color: 'w',
    opponent: { username: player2.user.username },
    fen: game.fen()
  }));

  player2.send(JSON.stringify({
    type: 'game_start',
    gameId,
    color: 'b',
    opponent: { username: player1.user.username },
    fen: game.fen()
  }));
}

function handleMove(ws, msg) {
  const gameId = players.get(ws);
  if (!gameId) {
    ws.send(JSON.stringify({ type: 'error', message: 'Not in a game' }));
    return;
  }

  const gameData = games.get(gameId);
  if (!gameData) return;

  const userId = ws.user.id;
  const playerColor = gameData.colors[userId];
  if (!playerColor) return;

  if (gameData.chess.turn() !== playerColor) {
    ws.send(JSON.stringify({ type: 'error', message: 'Not your turn' }));
    return;
  }

  try {
    const move = gameData.chess.move({ from: msg.from, to: msg.to, promotion: msg.promotion || 'q' });
    if (move) {
      gameData.moves.push(move);
      // Reset draw offers
      Object.keys(gameData.drawOffers).forEach(k => gameData.drawOffers[k] = false);
      
      const response = {
        type: 'move_made',
        from: msg.from,
        to: msg.to,
        promotion: msg.promotion,
        san: move.san,
        fen: gameData.chess.fen(),
        isCheck: gameData.chess.inCheck(),
        isCheckmate: gameData.chess.isCheckmate(),
        isDraw: gameData.chess.isDraw(),
        isStalemate: gameData.chess.isStalemate()
      };

      broadcast(gameId, response);

      if (gameData.chess.isCheckmate() || gameData.chess.isDraw()) {
        handleGameEnd(gameId, gameData.chess.isCheckmate() ? 
          (gameData.chess.turn() === 'w' ? 'black' : 'white') : 'draw');
      }
    } else {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
    }
  } catch (err) {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
  }
}

function handleResign(ws) {
  const gameId = players.get(ws);
  if (!gameId) return;
  
  const gameData = games.get(gameId);
  if (!gameData) return;

  const userId = ws.user.id;
  const playerColor = gameData.colors[userId];
  
  broadcast(gameId, {
    type: 'game_end',
    reason: 'resignation',
    winner: playerColor === 'w' ? 'black' : 'white'
  });

  cleanupGame(gameId);
}

function handleOfferDraw(ws) {
  const gameId = players.get(ws);
  if (!gameId) return;
  
  const gameData = games.get(gameId);
  if (!gameData) return;

  gameData.drawOffers[ws.user.id] = true;
  
  broadcast(gameId, {
    type: 'draw_offered',
    by: ws.user.username
  });

  // Auto-accept if both offered
  const playerIds = Object.keys(gameData.drawOffers);
  if (playerIds.length === 2 && gameData.drawOffers[playerIds[0]] && gameData.drawOffers[playerIds[1]]) {
    handleGameEnd(gameId, 'draw');
  }
}

function handleRespondDraw(ws, accept) {
  const gameId = players.get(ws);
  if (!gameId) return;
  
  const gameData = games.get(gameId);
  if (!gameData) return;

  if (accept) {
    handleGameEnd(gameId, 'draw');
  } else {
    broadcast(gameId, {
      type: 'draw_declined',
      by: ws.user.username
    });
    Object.keys(gameData.drawOffers).forEach(k => gameData.drawOffers[k] = false);
  }
}

function handleChat(ws, message) {
  const gameId = players.get(ws);
  if (!gameId || !message || message.length > 200) return;
  
  const gameData = games.get(gameId);
  if (!gameData) return;

  const chatMsg = {
    type: 'chat',
    username: ws.user.username,
    message: message.slice(0, 200),
    timestamp: Date.now()
  };
  
  gameData.chat.push(chatMsg);
  broadcast(gameId, chatMsg);
}

function handleGetGame(ws, gameId) {
  const gameData = games.get(gameId);
  if (!gameData) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
    return;
  }
  
  ws.send(JSON.stringify({
    type: 'game_state',
    gameId,
    fen: gameData.chess.fen(),
    moves: gameData.moves,
    turn: gameData.chess.turn()
  }));
}

function handleSpectate(ws, gameId) {
  const gameData = games.get(gameId);
  if (!gameData) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
    return;
  }
  
  gameData.spectators.push(ws);
  players.set(ws, gameId);
  
  ws.send(JSON.stringify({
    type: 'spectate_start',
    gameId,
    fen: gameData.chess.fen(),
    moves: gameData.moves,
    players: gameData.players.map(p => ({ username: p.user.username }))
  }));
}

function handleGameEnd(gameId, result) {
  const gameData = games.get(gameId);
  if (!gameData) return;

  broadcast(gameId, {
    type: 'game_end',
    reason: 'checkmate_or_draw',
    result,
    fen: gameData.chess.fen()
  });

  cleanupGame(gameId);
}

function cleanupGame(gameId) {
  const gameData = games.get(gameId);
  if (gameData) {
    gameData.players.forEach(ws => {
      players.delete(ws);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'game_over' }));
      }
    });
    gameData.spectators.forEach(ws => {
      players.delete(ws);
    });
  }
  games.delete(gameId);
}

function handleDisconnect(ws) {
  // Remove from waiting
  const idx = waitingPlayers.indexOf(ws);
  if (idx > -1) waitingPlayers.splice(idx, 1);

  // Leave current game
  const gameId = players.get(ws);
  if (gameId) {
    const gameData = games.get(gameId);
    if (gameData) {
      broadcast(gameId, {
        type: 'opponent_disconnected',
        message: `${ws.user?.username || 'Opponent'} disconnected`
      });
      cleanupGame(gameId);
    }
  }
  
  players.delete(ws);
}

// Ping interval for connection health
setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) {
      handleDisconnect(ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

function formatUser(user) {
  return {
    id: user.id,
    username: user.username,
    elo: user.elo,
    calibrationGames: user.calibration_games,
    gamesPlayed: user.games_played,
    gamesWon: user.games_won,
    gamesDrawn: user.games_drawn,
    gamesLost: user.games_lost
  };
}

module.exports = { wss };