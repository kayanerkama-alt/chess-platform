import React, { useState, useMemo } from 'react';
import { PIECE_UNICODE, PIECE_STYLES } from '../utils/themes';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

export default function Chessboard({ game, onMove, pieceStyle = 'standard', flipped = false }) {
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);

  const board = useMemo(() => game.board(), [game.fen()]);
  const style = PIECE_STYLES[pieceStyle] || PIECE_STYLES.standard;

  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;
  const displayFiles = flipped ? [...FILES].reverse() : FILES;

  function getPieceChar(piece) {
    if (!piece) return '';
    const key = `${piece.color === 'w' ? 'w' : 'b'}${piece.type.toUpperCase()}`;
    const chars = PIECE_UNICODE[style.type] || PIECE_UNICODE.unicode;
    return chars[key] || '';
  }

  function handleSquareClick(sq) {
    if (selected) {
      const move = legalMoves.find(m => m.includes(sq));
      if (move) {
        const result = onMove(selected, sq);
        if (result) setLastMove({ from: selected, to: sq });
      }
      setSelected(null);
      setLegalMoves([]);
    } else {
      const piece = game.get(sq);
      if (piece && piece.color === game.turn()) {
        setSelected(sq);
        const moves = game.moves({ square: sq, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      }
    }
  }

  return (
    <div className="chessboard-wrapper">
      <div className="chessboard">
        {displayRanks.map((rank, ri) => (
          displayFiles.map((file, fi) => {
            const sq = `${file}${rank}`;
            const isLight = (ri + fi) % 2 === 0;
            const piece = board[8 - rank]?.[file.charCodeAt(0) - 97];
            const isSelected = selected === sq;
            const isLegal = legalMoves.includes(sq);
            const isLastMove = lastMove && (lastMove.from === sq || lastMove.to === sq);

            return (
              <div key={sq}
                className={`square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isLastMove ? 'last-move' : ''}`}
                onClick={() => handleSquareClick(sq)}
                data-square={sq}>
                {isLegal && <div className={`legal-dot ${piece ? 'capture' : ''}`} />}
                {piece && (
                  <span className={`piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'} piece-style-${style.type}`}>
                    {getPieceChar(piece)}
                  </span>
                )}
                {fi === 0 && <span className="coord-rank">{rank}</span>}
                {ri === 7 && <span className="coord-file">{file}</span>}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}
