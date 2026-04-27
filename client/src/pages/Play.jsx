import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import Chessboard from '../components/Chessboard';
import { BOT_STYLES, PIECE_STYLES } from '../utils/themes';
import { getBotMove } from '../utils/chessBot';
import { useAuth } from '../utils/AuthContext';
import { games } from '../utils/api';

export default function Play({ theme }) {
  const { user, updateUser } = useAuth();
  const [game, setGame] = useState(new Chess());
  const [botType, setBotType] = useState('random');
  const [pieceStyle, setPieceStyle] = useState('standard');
  const [playerColor, setPlayerColor] = useState('w');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [eloResult, setEloResult] = useState(null);
  const moveListRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('chess-piece-style');
    if (saved && PIECE_STYLES[saved]) setPieceStyle(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('chess-piece-style', pieceStyle);
  }, [pieceStyle]);

  const submitGameResult = useCallback(async (g, result) => {
    try {
      const data = await games.submitResult({
        result,
        botType,
        playerColor,
        pgn: g.pgn(),
        movesCount: g.moveNumber(),
        anonymousId: !user ? (localStorage.getItem('chess-anon-id') || createAnonId()) : undefined
      });
      if (data.user && updateUser) updateUser(data.user);
      if (!data.anonymous) setEloResult(data);
    } catch (err) {
      console.error('Failed to submit game result:', err);
    }
  }, [botType, playerColor, user, updateUser]);

  function createAnonId() {
    const id = 'anon-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('chess-anon-id', id);
    return id;
  }

  const updateStatus = useCallback((g) => {
    if (g.isCheckmate()) {
      const result = g.turn() === playerColor ? 'loss' : 'win';
      setStatus(result === 'win' ? 'Checkmate! You won!' : 'Checkmate! You lost.');
      setGameOver(true);
      submitGameResult(g, result);
    } else if (g.isDraw()) {
      setStatus('Draw!');
      setGameOver(true);
      submitGameResult(g, 'draw');
    } else if (g.isStalemate()) {
      setStatus('Stalemate!');
      setGameOver(true);
      submitGameResult(g, 'draw');
    } else if (g.inCheck()) {
      setStatus('Check!');
    } else {
      setStatus(g.turn() === playerColor ? 'Your turn' : 'Bot thinking...');
    }
  }, [playerColor, submitGameResult]);

  const makeBotMove = useCallback((g) => {
    if (g.isGameOver() || g.turn() === playerColor) return;
    setThinking(true);
    setTimeout(() => {
      const move = getBotMove(g.fen(), botType);
      if (move) {
        g.move(move);
        const newGame = new Chess(g.fen());
        setGame(newGame);
        setMoveHistory(prev => [...prev, move]);
        updateStatus(newGame);
      }
      setThinking(false);
    }, 200);
  }, [botType, playerColor, updateStatus]);

  const handleMove = useCallback((from, to) => {
    if (game.turn() !== playerColor || game.isGameOver()) return false;
    try {
      const move = game.move({ from, to, promotion: 'q' });
      if (!move) return false;
      const newGame = new Chess(game.fen());
      setGame(newGame);
      setMoveHistory(prev => [...prev, move.san]);
      updateStatus(newGame);
      setTimeout(() => makeBotMove(newGame), 300);
      return true;
    } catch {
      return false;
    }
  }, [game, playerColor, updateStatus, makeBotMove]);

  const startGame = (color) => {
    const g = new Chess();
    setGame(g);
    setPlayerColor(color);
    setGameStarted(true);
    setGameOver(false);
    setMoveHistory([]);
    setEloResult(null);
    setStatus(color === 'w' ? 'Your turn' : 'Bot thinking...');
    if (color === 'b') {
      setTimeout(() => makeBotMove(g), 500);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setGame(new Chess());
    setMoveHistory([]);
    setStatus('');
    setEloResult(null);
  };

  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
    }
  }, [moveHistory]);

  if (!gameStarted) {
    return (
      <div className="play-setup">
        <h2>New Game</h2>
        {!user && (
          <div className="guest-banner">
            Playing as Guest &mdash; <a href="/register">Create an account</a> to track ELO and game history
          </div>
        )}
        {user && (
          <div className="elo-banner">
            <span className="elo-display">Your ELO: <strong>{user.elo}</strong></span>
            {user.calibrationGames < 2 && (
              <span className="calibration-info">Calibration: {user.calibrationGames}/2 games</span>
            )}
            <span className="stats-display">
              W: {user.gamesWon} / D: {user.gamesDrawn} / L: {user.gamesLost}
            </span>
          </div>
        )}

        <div className="setup-section">
          <h3>Choose Opponent</h3>
          <div className="bot-grid">
            {Object.entries(BOT_STYLES).map(([key, bot]) => (
              <button key={key}
                className={`bot-card ${botType === key ? 'selected' : ''}`}
                onClick={() => setBotType(key)}>
                <span className="bot-icon">{bot.icon}</span>
                <span className="bot-name">{bot.name}</span>
                <span className="bot-diff">{'★'.repeat(bot.difficulty)}{'☆'.repeat(6 - bot.difficulty)}</span>
                <span className="bot-desc">{bot.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <h3>Piece Style</h3>
          <div className="style-grid">
            {Object.entries(PIECE_STYLES).map(([key, s]) => (
              <button key={key}
                className={`style-card ${pieceStyle === key ? 'selected' : ''}`}
                onClick={() => setPieceStyle(key)}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <h3>Play As</h3>
          <div className="color-choice">
            <button className="btn btn-primary btn-lg" onClick={() => startGame('w')}>
              &#9812; White
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => startGame('b')}>
              &#9818; Black
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="play-page">
      <div className="game-area">
        <div className="board-container">
          <div className="player-bar opponent">
            <span className="player-name">{BOT_STYLES[botType]?.icon} {BOT_STYLES[botType]?.name}</span>
            {thinking && <span className="thinking-indicator">Thinking...</span>}
          </div>
          <Chessboard game={game} onMove={handleMove} pieceStyle={pieceStyle} flipped={playerColor === 'b'} />
          <div className="player-bar self">
            <span className="player-name">
              {user ? user.username : 'Guest'} ({playerColor === 'w' ? 'White' : 'Black'})
            </span>
            {user && <span className="elo-small">ELO: {user.elo}</span>}
          </div>
        </div>
        <div className="game-panel">
          <div className="game-status">{status}</div>
          {eloResult && (
            <div className={`elo-change ${eloResult.eloChange >= 0 ? 'positive' : 'negative'}`}>
              <span>ELO: {eloResult.eloBefore} → {eloResult.eloAfter}</span>
              <span className="elo-delta">({eloResult.eloChange >= 0 ? '+' : ''}{eloResult.eloChange})</span>
              {eloResult.isCalibration && <span className="calibration-tag">Calibration game</span>}
            </div>
          )}
          <div className="move-list" ref={moveListRef}>
            <h4>Moves</h4>
            {moveHistory.map((m, i) => (
              <span key={i} className={`move-item ${i % 2 === 0 ? 'white-move' : 'black-move'}`}>
                {i % 2 === 0 && <span className="move-num">{Math.floor(i / 2) + 1}.</span>}
                {m}
              </span>
            ))}
          </div>
          <div className="game-actions">
            <button className="btn btn-outline" onClick={resetGame}>New Game</button>
          </div>
        </div>
      </div>
    </div>
  );
}
