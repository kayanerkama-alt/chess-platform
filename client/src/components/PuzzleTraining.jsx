import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';

// Puzzle database with tactical positions
const PUZZLES = [
  {
    id: 1,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['Qxf7'],
    description: 'Mate in 1 - Smothered mate opportunity'
  },
  {
    id: 2,
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
    solution: ['Qxf3'],
    description: 'Fork the bishop and king'
  },
  {
    id: 3,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5',
    solution: ['Bxf7', 'Kf8', 'Bg5'],
    description: 'Fried Liver Attack - Win a pawn'
  },
  {
    id: 4,
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4',
    solution: ['Nxd4'],
    description: 'Win the bishop pair'
  },
  {
    id: 5,
    fen: 'r2qkb1r/ppp1pppp/2n2n2/3p1b2/3P1B2/2N2N2/PPP1PPPP/R2QKB1R w KQkq - 4 5',
    solution: ['Bg5'],
    description: 'Pin the knight'
  },
  {
    id: 6,
    fen: 'r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    solution: ['Nc3'],
    description: 'Develop with tempo'
  },
  {
    id: 7,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq d3 0 4',
    solution: ['exd4'],
    description: 'Capture the pawn'
  },
  {
    id: 8,
    fen: 'rnbqkbnr/ppp2ppp/8/3pp3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq d6 0 3',
    solution: ['Bxf7'],
    description: 'Win a pawn with Bxf7+'
  },
  {
    id: 9,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    solution: ['Ng5'],
    description: 'Scholar\'s Mate threat'
  },
  {
    id: 10,
    fen: 'r2qkbnr/ppp2ppp/2np4/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 0 5',
    solution: ['Nxc6'],
    description: 'Win a pawn'
  },
  {
    id: 11,
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    solution: ['Bc4'],
    description: 'Italian Game - Develop your bishop'
  },
  {
    id: 12,
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    solution: ['Bb5'],
    description: 'Ruy Lopez - The Spanish Game'
  },
  {
    id: 13,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5',
    solution: ['O-O'],
    description: 'Castle kingside for safety'
  },
  {
    id: 14,
    fen: 'rnbqkb1r/pppppppp/5n2/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 1 2',
    solution: ['e5'],
    description: 'Counter with central pawn'
  },
  {
    id: 15,
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e2 0 2',
    solution: ['Nf3'],
    description: 'Develop knight to protect pawn'
  },
  {
    id: 16,
    fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3',
    solution: ['exd5'],
    description: 'Capture and develop'
  },
  {
    id: 17,
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2',
    solution: ['Nf6'],
    description: 'Develop knights before bishops'
  },
  {
    id: 18,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    solution: ['d3'],
    description: 'Support the e4 pawn'
  },
  {
    id: 19,
    fen: 'r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 5',
    solution: ['Nc3'],
    description: 'Complete development'
  },
  {
    id: 20,
    fen: 'r2qkbnr/ppp2ppp/2n5/3pp3/2B1P1b1/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
    solution: ['Bxd5'],
    description: 'Win a pawn'
  }
];

export default function PuzzleTraining({ theme }) {
  const [puzzle, setPuzzle] = useState(null);
  const [game, setGame] = useState(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState('waiting');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    loadNextPuzzle();
  }, []);

  const loadNextPuzzle = () => {
    const randomPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    setPuzzle(randomPuzzle);
    setGame(new Chess(randomPuzzle.fen));
    setMoveIndex(0);
    setStatus('playing');
    setFeedback(null);
  };

  const handleMove = (from, to) => {
    if (!game || !puzzle || status !== 'playing') return false;
    
    const expectedMove = puzzle.solution[moveIndex];
    const tempGame = new Chess(game.fen());
    
    try {
      const move = tempGame.move({ from, to, promotion: 'q' });
      if (!move) return false;
      
      // Check if this matches the expected solution
      if (move.san === expectedMove || `${from}${to}` === expectedMove) {
        setGame(tempGame);
        const nextIndex = moveIndex + 1;
        
        if (nextIndex >= puzzle.solution.length) {
          // Puzzle completed!
          setStatus('solved');
          setScore(prev => prev + 10 + streak * 2);
          setStreak(prev => prev + 1);
          setFeedback({ type: 'success', message: 'Correct! Well done!' });
        } else {
          setMoveIndex(nextIndex);
          setFeedback({ type: 'info', message: 'Correct! Keep going...' });
        }
        return true;
      } else {
        // Wrong move
        setStatus('failed');
        setStreak(0);
        setAttempts(prev => prev + 1);
        setFeedback({ type: 'error', message: `Not quite. The solution was ${expectedMove}` });
        return false;
      }
    } catch {
      return false;
    }
  };

  const resetPuzzle = () => {
    if (puzzle) {
      setGame(new Chess(puzzle.fen));
      setMoveIndex(0);
      setStatus('playing');
      setFeedback(null);
    }
  };

  const skipPuzzle = () => {
    setAttempts(prev => prev + 1);
    setStreak(0);
    loadNextPuzzle();
  };

  const getHint = () => {
    if (!puzzle || !game) return;
    const expectedMove = puzzle.solution[moveIndex];
    setFeedback({ type: 'hint', message: `Hint: ${expectedMove}` });
  };

  if (!puzzle || !game) {
    return <div className="loading-screen">Loading puzzle...</div>;
  }

  return (
    <div className="puzzle-training">
      <div className="puzzle-header">
        <h2>Chess Puzzles</h2>
        <div className="puzzle-stats">
          <span className="stat">Score: {score}</span>
          <span className="stat">Streak: {streak}🔥</span>
          <span className="stat">Solved: {attempts > 0 ? Math.round((attempts - Math.floor(attempts/3)) / attempts * 100) : 0}%</span>
        </div>
      </div>

      <div className="puzzle-container">
        <div className="puzzle-board">
          <Chessboard 
            game={game} 
            onMove={handleMove} 
            pieceStyle="standard"
            flipped={game.turn() === 'b'}
          />
        </div>
        
        <div className="puzzle-info">
          <div className="puzzle-description">
            <h3>{puzzle.description}</h3>
            <p>Move {moveIndex + 1} of {puzzle.solution.length}</p>
          </div>

          {feedback && (
            <div className={`puzzle-feedback ${feedback.type}`}>
              {feedback.message}
            </div>
          )}

          <div className="puzzle-controls">
            <button className="btn btn-outline" onClick={getHint}>💡 Hint</button>
            <button className="btn btn-outline" onClick={resetPuzzle}>🔄 Reset</button>
            <button className="btn btn-primary" onClick={skipPuzzle}>Next Puzzle</button>
          </div>

          <div className="puzzle-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(moveIndex / puzzle.solution.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}