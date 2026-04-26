import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import Chessboard from '../components/Chessboard';
import { BOT_STYLES, PIECE_STYLES } from '../utils/themes';
import { getBotMove } from '../utils/chessBot';

export default function Play({ theme }) {
  const [game, setGame] = useState(new Chess());
  const [botType, setBotType] = useState('random');
  const [pieceStyle, setPieceStyle] = useState('standard');
  const [playerColor, setPlayerColor] = useState('w');
  const [gameStarted, setGameStarted] = useState(false);
  const [status, setStatus] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [thinking, setThinking] = useState(false);
  const moveListRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('chess-piece-style');
    if (saved && PIECE_STYLES[saved]) setPieceStyle(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('chess-piece-style', pieceStyle);
  }, [pieceStyle]);

  const updateStatus = useCallback((g) => {
    if (g.isCheckmate()) {
      setStatus(g.turn() === playerColor ? 'Checkmate! You lost.' : 'Checkmate! You won!');
    } else if (g.isDraw()) {
      setStatus('Draw!');
    } else if (g.isStalemate()) {
      setStatus('Stalemate!');
    } else if (g.inCheck()) {
      setStatus('Check!');
    } else {
      setStatus(g.turn() === playerColor ? 'Your turn' : 'Bot thinking...');
    }
  }, [playerColor]);

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
    setMoveHistory([]);
    setStatus(color === 'w' ? 'Your turn' : 'Bot thinking...');
    if (color === 'b') {
      setTimeout(() => makeBotMove(g), 500);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGame(new Chess());
    setMoveHistory([]);
    setStatus('');
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
            <span className="player-name">You ({playerColor === 'w' ? 'White' : 'Black'})</span>
          </div>
        </div>
        <div className="game-panel">
          <div className="game-status">{status}</div>
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
