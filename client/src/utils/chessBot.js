import { Chess } from 'chess.js';

const PIECE_VALUES = { p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0 };

const CENTER_SQUARES = ['d4', 'd5', 'e4', 'e5'];
const EXTENDED_CENTER = ['c3', 'c4', 'c5', 'c6', 'd3', 'd6', 'e3', 'e6', 'f3', 'f4', 'f5', 'f6'];

function evaluateBoard(game) {
  const board = game.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] || 0;
      const mult = piece.color === 'w' ? 1 : -1;
      score += val * mult;
      const sq = String.fromCharCode(97 + c) + (8 - r);
      if (CENTER_SQUARES.includes(sq)) score += 0.3 * mult;
      else if (EXTENDED_CENTER.includes(sq)) score += 0.1 * mult;
    }
  }
  return score;
}

function minimax(game, depth, alpha, beta, maximizing) {
  if (depth === 0 || game.isGameOver()) return evaluateBoard(game);
  const moves = game.moves();
  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const ev = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const ev = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function sortMoves(game, moves) {
  return moves.sort((a, b) => {
    const moveA = game.move(a);
    game.undo();
    const moveB = game.move(b);
    game.undo();
    let scoreA = 0, scoreB = 0;
    if (moveA.captured) scoreA += PIECE_VALUES[moveA.captured] * 10;
    if (moveB.captured) scoreB += PIECE_VALUES[moveB.captured] * 10;
    if (moveA.flags.includes('p')) scoreA += 8;
    if (moveB.flags.includes('p')) scoreB += 8;
    return scoreB - scoreA;
  });
}

export function getBotMove(fen, botType) {
  const game = new Chess(fen);
  const moves = game.moves();
  if (moves.length === 0) return null;

  switch (botType) {
    case 'random':
      return moves[Math.floor(Math.random() * moves.length)];

    case 'cautious': {
      const safeMoves = moves.filter(m => {
        game.move(m);
        const opp = game.moves();
        const hasThreat = opp.some(om => {
          const r = game.move(om);
          game.undo();
          return r && r.captured;
        });
        game.undo();
        return !hasThreat;
      });
      const pool = safeMoves.length > 0 ? safeMoves : moves;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    case 'aggressive': {
      const captures = moves.filter(m => {
        const r = game.move(m);
        game.undo();
        return r && r.captured;
      });
      const checks = moves.filter(m => {
        game.move(m);
        const inCheck = game.inCheck();
        game.undo();
        return inCheck;
      });
      const attackMoves = [...new Set([...checks, ...captures])];
      if (attackMoves.length > 0) return attackMoves[Math.floor(Math.random() * attackMoves.length)];
      return moves[Math.floor(Math.random() * moves.length)];
    }

    case 'positional': {
      let bestMove = moves[0];
      let bestScore = -Infinity;
      for (const m of moves) {
        game.move(m);
        let score = -evaluateBoard(game);
        game.undo();
        if (score > bestScore) { bestScore = score; bestMove = m; }
      }
      return bestMove;
    }

    case 'tactical': {
      const isBlack = game.turn() === 'b';
      const sorted = sortMoves(game, [...moves]);
      let bestMove = sorted[0];
      let bestScore = isBlack ? Infinity : -Infinity;
      for (const m of sorted.slice(0, 20)) {
        game.move(m);
        const score = minimax(game, 2, -Infinity, Infinity, isBlack);
        game.undo();
        if (isBlack ? score < bestScore : score > bestScore) {
          bestScore = score;
          bestMove = m;
        }
      }
      return bestMove;
    }

    case 'grandmaster': {
      const isBlack = game.turn() === 'b';
      const sorted = sortMoves(game, [...moves]);
      let bestMove = sorted[0];
      let bestScore = isBlack ? Infinity : -Infinity;
      for (const m of sorted.slice(0, 30)) {
        game.move(m);
        const score = minimax(game, 3, -Infinity, Infinity, isBlack);
        game.undo();
        if (isBlack ? score < bestScore : score > bestScore) {
          bestScore = score;
          bestMove = m;
        }
      }
      return bestMove;
    }

    default:
      return moves[Math.floor(Math.random() * moves.length)];
  }
}
