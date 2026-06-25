import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import Chessboard from '../components/Chessboard';
import { useAuth } from '../utils/AuthContext';
import { games } from '../utils/api';
import { BOT_STYLES } from '../utils/themes';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [replayGame, setReplayGame] = useState(null);
  const [currentMove, setCurrentMove] = useState(0);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const data = await games.history();
      setHistory(data.games || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const startReplay = (game) => {
    setSelectedGame(game);
    const g = new Chess();
    setReplayGame(g);
    setCurrentMove(0);
  };

  const replayMove = (dir) => {
    if (!replayGame || !selectedGame) return;
    
    if (dir === 'next' && currentMove < selectedGame.moves_count * 2) {
      const moves = replayGame.moves();
      if (moves.length > currentMove) {
        setCurrentMove(currentMove + 1);
      }
    } else if (dir === 'prev' && currentMove > 0) {
      replayGame.undo();
      setCurrentMove(currentMove - 1);
    } else if (dir === 'start') {
      setReplayGame(new Chess());
      setCurrentMove(0);
    } else if (dir === 'end') {
      const g = new Chess();
      if (selectedGame.pgn) {
        g.loadPgn(selectedGame.pgn);
      }
      setReplayGame(g);
      setCurrentMove(selectedGame.moves_count * 2);
    }
  };

  const stepReplay = (newMove) => {
    if (!replayGame || !selectedGame) return;
    
    if (newMove > currentMove) {
      // Move forward
      const moves = replayGame.moves();
      if (newMove <= moves.length) {
        replayGame.move(moves[newMove - 1]);
        setCurrentMove(newMove);
      }
    } else if (newMove < currentMove) {
      // Undo moves
      replayGame.undo();
      if (newMove > 0) {
        stepReplay(newMove);
      } else {
        setCurrentMove(0);
      }
    }
  };

  const getResultClass = (result) => {
    if (result === 'win') return 'result-win';
    if (result === 'loss') return 'result-loss';
    return 'result-draw';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="history-page">
        <div className="auth-required">
          <h2>Game History</h2>
          <p>Please <Link to="/login">sign in</Link> to view your game history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="history-page">
        <div className="loading-screen">Loading history...</div>
      </div>
    );
  }

  // Replay view
  if (selectedGame && replayGame) {
    return (
      <div className="history-page replay-view">
        <button className="btn btn-outline" onClick={() => setSelectedGame(null)}>
          ← Back to History
        </button>
        
        <div className="replay-container">
          <div className="replay-board">
            <Chessboard 
              game={replayGame} 
              onMove={() => {}} 
              pieceStyle="standard"
              flipped={selectedGame.player_color === 'b'}
            />
          </div>
          
          <div className="replay-panel">
            <div className="replay-info">
              <h3>Game vs {BOT_STYLES[selectedGame.opponent_type]?.name || selectedGame.opponent_type}</h3>
              <p>Played as {selectedGame.player_color === 'w' ? 'White' : 'Black'}</p>
              <p>Result: <span className={getResultClass(selectedGame.result)}>
                {selectedGame.result === 'win' ? 'Won' : selectedGame.result === 'loss' ? 'Lost' : 'Draw'}
              </span></p>
              {selectedGame.elo_before !== null && (
                <p>ELO: {selectedGame.elo_before} → {selectedGame.elo_after}</p>
              )}
              <p>Date: {formatDate(selectedGame.created_at)}</p>
            </div>
            
            <div className="replay-controls">
              <button className="btn btn-outline btn-sm" onClick={() => replayMove('start')}>⏮</button>
              <button className="btn btn-outline btn-sm" onClick={() => replayMove('prev')}>◀</button>
              <span className="move-counter">{Math.ceil(currentMove / 2)} / {selectedGame.moves_count || 0}</span>
              <button className="btn btn-outline btn-sm" onClick={() => replayMove('next')}>▶</button>
              <button className="btn btn-outline btn-sm" onClick={() => replayMove('end')}>⏭</button>
            </div>
            
            <div className="replay-moves">
              {replayGame.pgn().split(/\d+\.\s*/).filter(Boolean).map((pair, i) => (
                <div key={i} className="move-pair">
                  <span className="move-num">{i + 1}.</span>
                  <span className="move-white">{pair.trim().split(/\s+/)[0]}</span>
                  <span className="move-black">{pair.trim().split(/\s+/)[1] || ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // History list view
  return (
    <div className="history-page">
      <h2>Game History</h2>
      
      {history.length === 0 ? (
        <div className="empty-history">
          <p>No games played yet.</p>
          <Link to="/play" className="btn btn-primary">Play Now</Link>
        </div>
      ) : (
        <div className="history-list">
          <div className="history-stats">
            <div className="stat-card">
              <span className="stat-value">{user.gamesWon}</span>
              <span className="stat-label">Wins</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{user.gamesDrawn}</span>
              <span className="stat-label">Draws</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{user.gamesLost}</span>
              <span className="stat-label">Losses</span>
            </div>
            <div className="stat-card highlight">
              <span className="stat-value">{user.elo}</span>
              <span className="stat-label">Current ELO</span>
            </div>
          </div>

          {history.map((game) => (
            <div key={game.id} className="history-item" onClick={() => startReplay(game)}>
              <div className="history-result">
                <span className={`result-badge ${getResultClass(game.result)}`}>
                  {game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D'}
                </span>
              </div>
              <div className="history-details">
                <span className="history-opponent">
                  vs {BOT_STYLES[game.opponent_type]?.icon} {BOT_STYLES[game.opponent_type]?.name || game.opponent_type}
                </span>
                <span className="history-color">
                  ({game.player_color === 'w' ? 'White' : 'Black'})
                </span>
              </div>
              <div className="history-meta">
                <span className="history-moves">{game.moves_count} moves</span>
                <span className="history-date">{formatDate(game.created_at)}</span>
              </div>
              {game.elo_after !== null && (
                <div className="history-elo">
                  {game.elo_before} → {game.elo_after}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}