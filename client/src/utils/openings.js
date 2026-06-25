// Chess opening database with common openings and their variations
export const OPENINGS = {
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': {
    name: 'Starting Position',
    eco: null,
    moves: []
  },
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': {
    name: 'King\'s Pawn Opening',
    eco: 'C20',
    moves: ['e4']
  },
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': {
    name: 'Queen\'s Pawn Opening',
    eco: 'D00',
    moves: ['d4']
  },
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': {
    name: 'French Defense',
    eco: 'C00',
    moves: ['e4', 'e6']
  },
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': {
    name: 'French Defense, Normal Variation',
    eco: 'C01',
    moves: ['e4', 'e6', 'Nf3']
  },
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 2': {
    name: 'French Defense, Exchange Variation',
    eco: 'C02',
    moves: ['e4', 'e6', 'Nf3', 'd5']
  },
  'rnbqkb1r/pppp1ppp/4pn2/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3': {
    name: 'French Defense, Tarrasch Variation',
    eco: 'C03',
    moves: ['e4', 'e6', 'Nf3', 'd5', 'exd5']
  },
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2': {
    name: 'Petrov Defense',
    eco: 'C42',
    moves: ['e4', 'e5', 'Nf3']
  },
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': {
    name: 'Petrov Defense, Classical Variation',
    eco: 'C43',
    moves: ['e4', 'e5', 'Nf3', 'Nf6']
  },
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2': {
    name: 'Philidor Defense',
    eco: 'C41',
    moves: ['e4', 'e5', 'Nf3', 'd6']
  },
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 2': {
    name: 'Scotch Game',
    eco: 'C45',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4']
  },
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 2': {
    name: 'Three Knights Game',
    eco: 'C46',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3']
  },
  'r1bqkbnr/ppp2ppp/2np4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3': {
    name: 'Four Knights Game',
    eco: 'C48',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6']
  },
  'r1bqkbnr/ppp2ppp/2np4/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 3 3': {
    name: 'Four Knights Game, Spanish Variation',
    eco: 'C49',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'Bb5']
  },
  'rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq d6 0 3': {
    name: 'Scandinavian Defense',
    eco: 'B01',
    moves: ['e4', 'd5', 'exd5']
  },
  'rnbqkbnr/ppp2ppp/8/3pp3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 3': {
    name: 'Scandinavian Defense, Main Line',
    eco: 'B01',
    moves: ['e4', 'd5', 'exd5', 'Nf6']
  },
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2': {
    name: 'Alekhine Defense',
    eco: 'B02',
    moves: ['e4', 'Nf6']
  },
  'rnbqkb1r/ppppnppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3': {
    name: 'Pirc Defense',
    eco: 'B07',
    moves: ['e4', 'd6', 'd4', 'Nf6']
  },
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': {
    name: 'Indian Defenses',
    eco: null,
    moves: ['e4']
  },
  'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2': {
    name: 'Indian Defenses',
    eco: null,
    moves: ['d4', 'Nf6']
  },
  'rnbqkb1r/pppppppp/5n2/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2': {
    name: 'Indian Defense, Budapest Gambit',
    eco: 'A52',
    moves: ['d4', 'Nf6', 'c4', 'e5']
  },
  'rnbqkb1r/pppppppp/5n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 2': {
    name: 'Indian Defense, English Attack',
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6']
  },
  'rnbqkb1r/pppppppp/5n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq d6 0 3': {
    name: 'Modern Defense',
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3']
  },
  'rnbqkb1r/pppppppp/5n2/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2': {
    name: 'Grünfeld Defense',
    eco: 'D70',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7']
  },
  'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3': {
    name: 'Grünfeld Defense, Exchange Variation',
    eco: 'D85',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5']
  },
  'rnbqkb1r/pppppppp/5n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 2 2': {
    name: 'King\'s Indian Defense',
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6']
  },
  'rnbqkb1r/pppppppp/5n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 3 2': {
    name: 'King\'s Indian Defense, Normal Variation',
    eco: 'E61',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3']
  },
  'rnbqkb1r/pppppppp/5n2/8/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 3 3': {
    name: 'King\'s Indian Defense, Fianchetto',
    eco: 'E62',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'Nf3']
  },
  'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2': {
    name: 'Benoni Defense',
    eco: 'A56',
    moves: ['d4', 'Nf6', 'c4', 'c5']
  },
  'rnbqkb1r/pppppppp/5n2/8/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq - 0 2': {
    name: 'Benoni Defense, Modern Variation',
    eco: 'A57',
    moves: ['d4', 'Nf6', 'c4', 'c5', 'Nc3']
  },
  'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3': {
    name: 'Nimzo-Indian Defense',
    eco: 'E20',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3']
  },
  'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 3': {
    name: 'Nimzo-Indian Defense, Leningrad Variation',
    eco: 'E34',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4']
  },
  'rnbqkb1r/pppppppp/5n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 2 2': {
    name: 'Queen\'s Indian Defense',
    eco: 'E12',
    moves: ['d4', 'Nf6', 'c4', 'e6']
  },
  'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c6 0 2': {
    name: 'Slav Defense',
    eco: 'D11',
    moves: ['d4', 'd5', 'c4', 'c6']
  },
  'rnbqkb1r/ppp1pppp/3p1n2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3': {
    name: 'Slav Defense, Exchange Variation',
    eco: 'D35',
    moves: ['d4', 'd5', 'c4', 'c6', 'cxd5']
  },
  'rnbqkb1r/pppppppp/5n2/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 2 2': {
    name: 'Catalan Opening',
    eco: 'E00',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'g3']
  },
  'rnbqkb1r/pppppppp/5n2/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d5 0 3': {
    name: 'London System',
    eco: 'A48',
    moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4']
  },
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': {
    name: 'English Opening',
    eco: 'A10',
    moves: ['c4']
  },
  'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1': {
    name: 'English Opening',
    eco: 'A10',
    moves: ['c4']
  },
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': {
    name: 'Réti Opening',
    eco: 'A00',
    moves: ['Nf3']
  },
  'rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 2': {
    name: 'Réti Opening, Reversed Sicilian',
    eco: 'A04',
    moves: ['Nf3', 'c5']
  }
};

// Get opening by FEN
export function getOpeningByFen(fen) {
  // Normalize FEN for lookup (take first 4 parts)
  const fenKey = fen.split(' ').slice(0, 4).join(' ');
  return OPENINGS[fenKey] || null;
}

// Get opening name from move history
export function getOpeningFromMoves(moves) {
  const tempFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  let currentFen = tempFen;
  
  for (let i = 1; i <= moves.length; i++) {
    const partialMoves = moves.slice(0, i);
    const fenKey = currentFen.split(' ').slice(0, 4).join(' ');
    const opening = OPENINGS[fenKey];
    if (opening) {
      return {
        ...opening,
        ply: i
      };
    }
    // This is simplified - in real implementation, you'd need chess.js to compute FENs
  }
  
  return null;
}

// ECO code descriptions
export const ECO_DESCRIPTIONS = {
  'A00': 'Uncommon Opening',
  'A10': 'English Opening',
  'A48': 'London System',
  'A52': 'Budapest Gambit',
  'A56': 'Benoni Defense',
  'A57': 'Benoni Defense',
  'B01': 'Scandinavian Defense',
  'B02': 'Alekhine Defense',
  'B07': 'Pirc Defense',
  'C00': 'French Defense',
  'C01': 'French Defense',
  'C02': 'French Defense',
  'C03': 'French Defense',
  'C20': 'King\'s Pawn Game',
  'C41': 'Philidor Defense',
  'C42': 'Petrov Defense',
  'C43': 'Petrov Defense',
  'C45': 'Scotch Game',
  'C46': 'Three Knights Game',
  'C48': 'Four Knights Game',
  'C49': 'Four Knights Game',
  'D00': 'Queen\'s Pawn Game',
  'D11': 'Slav Defense',
  'D35': 'QGD, Exchange',
  'D70': 'Grünfeld Defense',
  'D85': 'Grünfeld, Exchange',
  'E00': 'Catalan Opening',
  'E12': 'Queen\'s Indian',
  'E20': 'Nimzo-Indian',
  'E34': 'Nimzo-Indian, Leningrad',
  'E60': 'King\'s Indian Defense',
  'E61': 'King\'s Indian Defense',
  'E62': 'King\'s Indian, Fianchetto'
};

// Get random opening for puzzle/training
export function getRandomOpening() {
  const openings = Object.values(OPENINGS).filter(o => o.eco);
  return openings[Math.floor(Math.random() * openings.length)];
}