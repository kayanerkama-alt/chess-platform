import { Chess } from 'chess.js';

// Material values for evaluation
const PIECE_VALUES = { p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0 };

// Position bonuses (from white's perspective)
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

// Get position bonus for a piece
function getPositionBonus(piece, square, isEndgame) {
  const row = Math.floor(square / 8);
  const col = square % 8;
  const flip = piece.color === 'b' ? 7 - row : row;
  
  switch (piece.type) {
    case 'p': return PAWN_TABLE[flip][col];
    case 'n': return KNIGHT_TABLE[flip][col];
    case 'b': return BISHOP_TABLE[flip][col];
    case 'r': return ROOK_TABLE[flip][col];
    case 'q': return QUEEN_TABLE[flip][col];
    case 'k': return isEndgame ? KING_TABLE[flip][col] : 0;
    default: return 0;
  }
}

// Evaluate the board position
export function evaluatePosition(game) {
  const board = game.board();
  let score = 0;
  let whiteMaterial = 0;
  let blackMaterial = 0;
  let whiteKingRow = -1, whiteKingCol = -1;
  let blackKingRow = -1, blackKingCol = -1;
  
  // Check if in endgame (no queens or both sides have limited material)
  let queenCount = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        if (piece.type === 'q') queenCount++;
        if (piece.color === 'w' && piece.type === 'k') {
          whiteKingRow = r; whiteKingCol = c;
        } else if (piece.color === 'b' && piece.type === 'k') {
          blackKingRow = r; blackKingCol = c;
        }
      }
    }
  }
  
  const isEndgame = queenCount === 0 || 
    (whiteMaterial < 10 && blackMaterial < 10) ||
    (Math.abs(whiteKingRow - blackKingRow) + Math.abs(whiteKingCol - blackKingCol) > 8);
  
  // Calculate material and position
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      
      const square = r * 8 + c;
      const value = PIECE_VALUES[piece.type] || 0;
      const posBonus = getPositionBonus(piece, square, isEndgame);
      
      if (piece.color === 'w') {
        score += value + posBonus * 0.1;
        whiteMaterial += value;
      } else {
        score -= value + posBonus * 0.1;
        blackMaterial += value;
      }
    }
  }
  
  // Mobility bonus
  const moves = game.moves().length;
  const turn = game.turn();
  if (turn === 'w') {
    score += moves * 0.1;
  } else {
    score -= moves * 0.1;
  }
  
  // King safety in opening/middlegame
  if (!isEndgame) {
    // Penalize exposed kings
    if (turn === 'w') {
      // King on starting square is safer
      if (whiteKingRow === 7 && (whiteKingCol === 4 || whiteKingCol === 3)) {
        score += 0.5;
      }
    } else {
      if (blackKingRow === 0 && (blackKingCol === 4 || blackKingCol === 3)) {
        score -= 0.5;
      }
    }
  }
  
  return score;
}

// Get best move suggestion (hint)
export function getMoveHint(game, difficulty = 'medium') {
  const moves = game.moves();
  if (moves.length === 0) return null;
  
  let bestMove = null;
  let bestScore = game.turn() === 'w' ? -Infinity : Infinity;
  
  // Evaluate all moves
  const evaluatedMoves = moves.map(move => {
    game.move(move);
    const score = evaluatePosition(game);
    game.undo();
    return { move, score };
  });
  
  // Sort by score (best for current player)
  evaluatedMoves.sort((a, b) => {
    return game.turn() === 'w' ? b.score - a.score : a.score - b.score;
  });
  
  // Return based on difficulty
  const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
  const idx = Math.floor(Math.random() * Math.min(difficulty === 'easy' ? 3 : difficulty === 'medium' ? 2 : 1, topMoves.length));
  return topMoves[idx]?.move || moves[0];
}

// Analyze move quality
export function analyzeMove(game, move, previousFen) {
  const prevGame = new Chess(previousFen);
  const prevScore = evaluatePosition(prevGame);
  const newScore = evaluatePosition(game);
  
  let quality = 'good';
  let improvement = newScore - prevScore;
  
  if (game.turn() === 'b') {
    improvement = -improvement; // Invert for white's perspective
  }
  
  if (improvement < -2) quality = 'mistake';
  else if (improvement < -0.5) quality = 'inaccuracy';
  else if (improvement > 2) quality = 'brilliant';
  else if (improvement > 0.5) quality = 'good';
  
  // Check for special moves
  if (move.includes('x')) quality = quality === 'good' ? 'good' : quality; // Capture
  if (move.includes('+')) quality = quality === 'good' ? 'good' : quality; // Check
  if (move.includes('#')) quality = 'brilliant'; // Checkmate
  
  return { quality, improvement };
}

// Get game phase
export function getGamePhase(game) {
  let totalMaterial = 0;
  const board = game.board();
  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type !== 'k') {
        totalMaterial += PIECE_VALUES[piece.type] || 0;
      }
    }
  }
  
  if (totalMaterial > 30) return 'opening';
  if (totalMaterial > 12) return 'middlegame';
  return 'endgame';
}

// Get positional assessment
export function getAssessment(game) {
  const score = evaluatePosition(game);
  const phase = getGamePhase(game);
  
  let assessment = 'Equal';
  let winningChances = 'Even';
  
  if (score > 3) {
    assessment = 'Winning';
    winningChances = 'White has a significant advantage';
  } else if (score > 1) {
    assessment = 'Advantage';
    winningChances = 'White is slightly better';
  } else if (score < -3) {
    assessment = 'Winning';
    winningChances = 'Black has a significant advantage';
  } else if (score < -1) {
    assessment = 'Advantage';
    winningChances = 'Black is slightly better';
  }
  
  return {
    assessment,
    winningChances,
    phase,
    score: score.toFixed(1),
    evaluation: scoreToEvaluation(score)
  };
}

// Convert score to chess.com style evaluation
export function scoreToEvaluation(score) {
  if (Math.abs(score) < 0.2) return '0.0';
  if (score > 0) {
    if (score >= 5) return `+${Math.floor(score)}`;
    return `+${score.toFixed(1)}`;
  } else {
    if (score <= -5) return `${Math.ceil(score)}`;
    return score.toFixed(1);
  }
}