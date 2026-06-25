import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import Chessboard from '../components/Chessboard';
import { BOT_STYLES, PIECE_STYLES } from '../utils/themes';
import { getBotMove } from '../utils/chessBot';
import { useAuth } from '../utils/AuthContext';
import { games } from '../utils/api';
import { getAssessment, getMoveHint } from '../utils/gameAnalysis';
import { sounds } from '../utils/sounds';
import { useMultiplayer } from '../utils/useMultiplayer';

export default function Play({ theme }) {
  const { user, updateUser } = useAuth();
  const [game, setGame] = useState(new Chess());
  const [botType, setBotType] = useState('random');
  const [pieceStyle, setPieceStyle] = useState('standard');
  const [playerColor, setPlayerColor] = useState('w');
  const [gameMode, setGameMode] = useState('bot'); // 'bot' or 'multiplayer'
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [eloResult, setEloResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintMove, setHintMove] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [undoHistory, setUndoHistory] = useState([]);
  const moveListRef = useRef(null);

  // Multiplayer
  const mp = useMultiplayer(user);

  useEffect(() => {
    const saved = localStorage.getItem('chess-piece-style');
    if (saved && PIECE_STYLES[saved]) setPieceStyle(saved);
    const savedSound = localStorage.getItem('chess-sound');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('chess-piece-style', pieceStyle);
  }, [pieceStyle]);

  useEffect(() => {
    localStorage.setItem('chess-sound', soundEnabled.toString());
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

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
      if (soundEnabled) sounds.play('checkmate');
      submitGameResult(g, result);
    } else if (g.isDraw()) {
      setStatus('Draw!');
      setGameOver(true);
      if (soundEnabled) sounds.play('draw');
      submitGameResult(g, 'draw');
    } else if (g.isStalemate()) {
      setStatus('Stalemate!');
      setGameOver(true);
      submitGameResult(g, 'draw');
    } else if (g.inCheck()) {
      setStatus('Check!');
      if (soundEnabled) sounds.play('check');
    } else {
      setStatus(g.turn() === playerColor ? 'Your turn' : 'Bot thinking...');
    }
    
    // Update analysis
    setAnalysis(getAssessment(g));
  }, [playerColor, submitGameResult, soundEnabled]);

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
        if (soundEnabled) sounds.play('move');
        updateStatus(newGame);
      }
      setThinking(false);
    }, 200);
  }, [botType, playerColor, updateStatus, soundEnabled]);

  const handleMove = useCallback((from, to) => {
    if (game.turn() !== playerColor || game.isGameOver()) return false;
    try {
      const prevFen = game.fen();
      const move = game.move({ from, to, promotion: 'q' });
      if (!move) return false;
      
      // Track undo history
      setUndoHistory(prev => [...prev.slice(-4), { fen: prevFen, move: move.san }]);
      setHintMove(null);
      setShowHint(false);
      
      const newGame = new Chess(game.fen());
      setGame(newGame);
      setMoveHistory(prev => [...prev, move.san]);
      
      if (soundEnabled) {
        if (move.captured) sounds.play('capture');
        else if (move.flags.includes('k') || move.flags.includes('q')) sounds.play('castle');
        else if (move.flags.includes('p')) sounds.play('promotion');
        else sounds.play('move');
      }
      
      updateStatus(newGame);
      if (gameMode === 'bot') {
        setTimeout(() => makeBotMove(newGame), 300);
      }
      return true;
    } catch {
      if (soundEnabled) sounds.play('illegal');
      return false;
    }
  }, [game, playerColor, updateStatus, makeBotMove, soundEnabled, gameMode]);

  const startGame = (color) => {
    const g = new Chess();
    setGame(g);
    setPlayerColor(color);
    setGameStarted(true);
    setGameOver(false);
    setMoveHistory([]);
    setEloResult(null);
    setUndoHistory([]);
    setAnalysis(getAssessment(g));
    setHintMove(null);
    setShowHint(false);
    setStatus(color === 'w' ? 'Your turn' : 'Bot thinking...');
    if (color === 'b' && gameMode === 'bot') {
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
    setAnalysis(null);
    setHintMove(null);
    setShowHint(false);
    setUndoHistory([]);
  };

  const undoMove = () => {
    if (undoHistory.length < 2 || game.isGameOver()) return;
    
    // Undo both player and bot moves
    const undoStates = undoHistory.slice(-2);
    setUndoHistory(prev => prev.slice(0, -2));
    
    let g = new Chess();
    undoStates.reverse().forEach(() => g.undo());
    g = new Chess(g.fen());
    setGame(g);
    setMoveHistory(prev => prev.slice(0, -(undoStates.length)));
    updateStatus(g);
  };

  const requestHint = () => {
    if (game.isGameOver() || game.turn() !== playerColor) return;
    const hint = getMoveHint(game);
    setHintMove(hint);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000);
  };

  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
    }
  }, [moveHistory]);

  // Handle multiplayer moves
  useEffect(() => {
    if (mp.game && mp.moves.length !== moveHistory.length) {
      setMoveHistory(mp.moves.map(m => m.san || m));
      setAnalysis(getAssessment(mp.game));
      if (soundEnabled) sounds.play('move');
    }
  }, [mp.moves, moveHistory.length, soundEnabled]);

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
          <h3>Game Mode</h3>
          <div className="style-grid">
            <button
              className={`style-card ${gameMode === 'bot' ? 'selected' : ''}`}
              onClick={() => setGameMode('bot')}>
              🤖 vs Bot
            </button>
            <button
              className={`style-card ${gameMode === 'multiplayer' ? 'selected' : ''}`}
              onClick={() => setGameMode('multiplayer')}
              disabled={!user}>
              👥 Multiplayer {!user && '(Login required)'}
            </button>
          </div>
        </div>

        {gameMode === 'bot' && (
          <>
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
          </>
        )}

        {gameMode === 'multiplayer' && user && (
          <div className="setup-section">
            <h3>Find Match</h3>
            {mp.status === 'matching' ? (
              <div className="matching-status">
                <div className="spinner"></div>
                <p>Finding opponent...</p>
                <button className="btn btn-outline" onClick={mp.cancelMatch}>Cancel</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={mp.findMatch}>
                🎯 Find Online Match
              </button>
            )}
            {mp.error && <div className="auth-error">{mp.error}</div>}
          </div>
        )}
      </div>
    );
  }

  // Multiplayer game view
  if (gameMode === 'multiplayer' && mp.game) {
    return (
      <div className="play-page">
        <div className="game-area">
          <div className="board-container">
            <div className="player-bar opponent">
              <span className="player-name">👤 {mp.opponent?.username || 'Opponent'}</span>
            </div>
            <Chessboard 
              game={mp.game} 
              onMove={(from, to) => mp.makeMove(from, to)} 
              pieceStyle={pieceStyle} 
              flipped={mp.playerColor === 'b'} 
            />
            <div className="player-bar self">
              <span className="player-name">
                {user?.username} ({mp.playerColor === 'w' ? 'White' : 'Black'})
              </span>
            </div>
          </div>
          <div className="game-panel">
            <div className="game-status">{mp.status === 'playing' ? 'Game in progress' : mp.status}</div>
            <div className="move-list" ref={moveListRef}>
              <h4>Moves</h4>
              {mp.moves.map((m, i) => (
                <span key={i} className={`move-item ${i % 2 === 0 ? 'white-move' : 'black-move'}`}>
                  {i % 2 === 0 && <span className="move-num">{Math.floor(i / 2) + 1}.</span>}
                  {m.san || m}
                </span>
              ))}
            </div>
            <div className="game-actions">
              <button className="btn btn-outline" onClick={mp.offerDraw}>Offer Draw</button>
              <button className="btn btn-outline logout-btn" onClick={mp.resign}>Resign</button>
            </div>
            {mp.drawOffer && (
              <div className="draw-offer">
                <p>{mp.drawOffer} offers a draw!</p>
                <button className="btn btn-primary" onClick={() => mp.respondDraw(true)}>Accept</button>
                <button className="btn btn-outline" onClick={() => mp.respondDraw(false)}>Decline</button>
              </div>
            )}
            <button className="btn btn-outline" onClick={mp.leaveGame}>Leave Game</button>
          </div>
        </div>
      </div>
    );
  }

  // Bot game view
  return (
    <div className="play-page">
      <div className="game-area">
        <div className="board-container">
          <div className="player-bar opponent">
            <span className="player-name">{BOT_STYLES[botType]?.icon} {BOT_STYLES[botType]?.name}</span>
            {thinking && <span className="thinking-indicator">Thinking...</span>}
          </div>
          <Chessboard 
            game={game} 
            onMove={handleMove} 
            pieceStyle={pieceStyle} 
            flipped={playerColor === 'b'} 
          />
          <div className="player-bar self">
            <span className="player-name">
              {user ? user.username : 'Guest'} ({playerColor === 'w' ? 'White' : 'Black'})
            </span>
            {user && <span className="elo-small">ELO: {user.elo}</span>}
          </div>
        </div>
        <div className="game-panel">
          <div className="game-status">{status}</div>
          
          {analysis && (
            <div className="analysis-bar">
              <span className="eval-score">{analysis.evaluation}</span>
              <span className="eval-phase">({analysis.phase})</span>
            </div>
          )}
          
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
          
          <div className="game-controls">
            <button className="btn btn-outline btn-sm" onClick={requestHint} title="Get hint">
              💡 Hint
            </button>
            <button className="btn btn-outline btn-sm" onClick={undoMove} disabled={undoHistory.length < 2}>
              ↩️ Undo
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
          
          {showHint && hintMove && (
            <div className="hint-popup">
              Suggested: {hintMove}
            </div>
          )}
          
          <div className="game-actions">
            <button className="btn btn-outline" onClick={resetGame}>New Game</button>
          </div>
        </div>
      </div>
    </div>
  );
}
