export const THEMES = {
  classic: {
    name: 'Classic',
    light: '#f0d9b5',
    dark: '#b58863',
    bg: '#fafafa',
    text: '#1a1a1a',
    accent: '#7b61ff',
    panel: '#ffffff',
    border: '#e0e0e0',
    highlight: 'rgba(255, 255, 0, 0.4)',
    moveHighlight: 'rgba(0, 150, 0, 0.3)'
  },
  dark: {
    name: 'Dark Mode',
    light: '#738796',
    dark: '#4b6584',
    bg: '#1a1a2e',
    text: '#e0e0e0',
    accent: '#e8d44d',
    panel: '#16213e',
    border: '#2a2a4a',
    highlight: 'rgba(232, 212, 77, 0.4)',
    moveHighlight: 'rgba(100, 200, 100, 0.3)'
  },
  forest: {
    name: 'Forest',
    light: '#a8c686',
    dark: '#5a7247',
    bg: '#1b2d1b',
    text: '#d4e8c2',
    accent: '#8bc34a',
    panel: '#243524',
    border: '#3a5a3a',
    highlight: 'rgba(139, 195, 74, 0.4)',
    moveHighlight: 'rgba(200, 230, 160, 0.3)'
  },
  ocean: {
    name: 'Ocean',
    light: '#8ec5d6',
    dark: '#3a7ca5',
    bg: '#0a1628',
    text: '#c8e6f0',
    accent: '#00bcd4',
    panel: '#0d2137',
    border: '#1a3a5c',
    highlight: 'rgba(0, 188, 212, 0.4)',
    moveHighlight: 'rgba(100, 200, 220, 0.3)'
  },
  sunset: {
    name: 'Sunset',
    light: '#f4c587',
    dark: '#c97b3d',
    bg: '#2d1b0e',
    text: '#f5e6d3',
    accent: '#ff7043',
    panel: '#3d2517',
    border: '#5d3a22',
    highlight: 'rgba(255, 112, 67, 0.4)',
    moveHighlight: 'rgba(255, 180, 120, 0.3)'
  },
  midnight: {
    name: 'Midnight',
    light: '#7986cb',
    dark: '#3f51b5',
    bg: '#0d0d1a',
    text: '#c5cae9',
    accent: '#536dfe',
    panel: '#1a1a2e',
    border: '#283593',
    highlight: 'rgba(83, 109, 254, 0.4)',
    moveHighlight: 'rgba(120, 140, 255, 0.3)'
  },
  rose: {
    name: 'Rose',
    light: '#f8bbd0',
    dark: '#c2185b',
    bg: '#1a0a10',
    text: '#fce4ec',
    accent: '#e91e63',
    panel: '#2a1020',
    border: '#4a1a30',
    highlight: 'rgba(233, 30, 99, 0.4)',
    moveHighlight: 'rgba(255, 150, 180, 0.3)'
  },
  ice: {
    name: 'Ice',
    light: '#e0f7fa',
    dark: '#80deea',
    bg: '#e8f5f8',
    text: '#1a3a4a',
    accent: '#0097a7',
    panel: '#f0fafb',
    border: '#b2ebf2',
    highlight: 'rgba(0, 151, 167, 0.3)',
    moveHighlight: 'rgba(100, 220, 230, 0.3)'
  }
};

export const PIECE_STYLES = {
  standard: { name: 'Standard (Unicode)', type: 'unicode' },
  bold: { name: 'Bold', type: 'unicode-bold' },
  text: { name: 'Text Letters', type: 'text' },
  minimal: { name: 'Minimal Dots', type: 'minimal' }
};

export const PIECE_UNICODE = {
  unicode: {
    wK: '\u2654', wQ: '\u2655', wR: '\u2656', wB: '\u2657', wN: '\u2658', wP: '\u2659',
    bK: '\u265A', bQ: '\u265B', bR: '\u265C', bB: '\u265D', bN: '\u265E', bP: '\u265F'
  },
  'unicode-bold': {
    wK: '\u2654', wQ: '\u2655', wR: '\u2656', wB: '\u2657', wN: '\u2658', wP: '\u2659',
    bK: '\u265A', bQ: '\u265B', bR: '\u265C', bB: '\u265D', bN: '\u265E', bP: '\u265F'
  },
  text: {
    wK: 'K', wQ: 'Q', wR: 'R', wB: 'B', wN: 'N', wP: 'P',
    bK: 'K', bQ: 'Q', bR: 'R', bB: 'B', bN: 'N', bP: 'P'
  },
  minimal: {
    wK: '\u25C9', wQ: '\u25C8', wR: '\u25A3', wB: '\u25C7', wN: '\u25C6', wP: '\u25CF',
    bK: '\u25C9', bQ: '\u25C8', bR: '\u25A3', bB: '\u25C7', bN: '\u25C6', bP: '\u25CF'
  }
};

export const BOT_STYLES = {
  random: {
    name: 'Beginner Bot',
    description: 'Makes random legal moves. Great for learning.',
    difficulty: 1,
    icon: '🤖'
  },
  cautious: {
    name: 'Cautious Bot',
    description: 'Prefers safe moves, avoids trades.',
    difficulty: 2,
    icon: '🛡️'
  },
  aggressive: {
    name: 'Aggressive Bot',
    description: 'Loves captures and attacks the king.',
    difficulty: 3,
    icon: '⚔️'
  },
  positional: {
    name: 'Positional Bot',
    description: 'Controls the center, develops pieces wisely.',
    difficulty: 4,
    icon: '🎯'
  },
  tactical: {
    name: 'Tactical Bot',
    description: 'Looks for forks, pins, and combinations.',
    difficulty: 5,
    icon: '🧠'
  },
  grandmaster: {
    name: 'Grandmaster Bot',
    description: 'Deep calculation with opening knowledge.',
    difficulty: 6,
    icon: '👑'
  }
};
