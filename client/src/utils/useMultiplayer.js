import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { sounds } from './sounds';

const WS_URL = window.location.hostname === 'localhost' 
  ? 'ws://localhost:3001/ws' 
  : `wss://${window.location.host}/ws`;

export function useMultiplayer(user) {
  const [ws, setWs] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [game, setGame] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [moves, setMoves] = useState([]);
  const [chat, setChat] = useState([]);
  const [drawOffer, setDrawOffer] = useState(null);
  const [error, setError] = useState(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (!user) return;
    
    const websocket = new WebSocket(WS_URL);
    
    websocket.onopen = () => {
      setStatus('connected');
      // Authenticate
      websocket.send(JSON.stringify({ type: 'auth', token: document.cookie.match(/token=([^;]+)/)?.[1] }));
    };

    websocket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleMessage(msg);
    };

    websocket.onclose = () => {
      setStatus('disconnected');
      // Auto reconnect
      reconnectTimer.current = setTimeout(() => {
        if (user) connect();
      }, 3000);
    };

    websocket.onerror = () => {
      setError('Connection error');
    };

    setWs(websocket);
  }, [user]);

  const handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'auth_success':
        setStatus('authenticated');
        break;
        
      case 'waiting_for_match':
        setStatus('matching');
        break;
        
      case 'match_cancelled':
        setStatus('authenticated');
        break;
        
      case 'game_start':
        setGame(new Chess());
        setGameId(msg.gameId);
        setPlayerColor(msg.color);
        setOpponent(msg.opponent);
        setMoves([]);
        setChat([]);
        setDrawOffer(null);
        setStatus('playing');
        sounds.play('move');
        break;
        
      case 'move_made':
        if (game) {
          const newGame = new Chess(msg.fen);
          const lastMove = moves[moves.length - 1];
          setGame(newGame);
          setMoves(prev => [...prev, { san: msg.san, from: msg.from, to: msg.to }]);
          
          if (msg.isCheckmate) {
            sounds.play('checkmate');
          } else if (msg.isCheck) {
            sounds.play('check');
          } else {
            sounds.play('move');
          }
        }
        break;
        
      case 'draw_offered':
        setDrawOffer(msg.by);
        break;
        
      case 'draw_declined':
        setDrawOffer(null);
        break;
        
      case 'chat':
        setChat(prev => [...prev, msg]);
        break;
        
      case 'game_end':
        setStatus(msg.result === 'draw' ? 'draw' : 'won');
        if (msg.reason === 'resignation') {
          sounds.play('move');
        } else {
          sounds.play('checkmate');
        }
        break;
        
      case 'opponent_disconnected':
        setError(msg.message);
        setStatus('disconnected');
        break;
        
      case 'game_over':
        setStatus('finished');
        break;
        
      case 'error':
        setError(msg.message);
        break;
    }
  }, [game, moves]);

  const findMatch = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'find_match' }));
      setStatus('matching');
    }
  }, [ws]);

  const cancelMatch = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'cancel_match' }));
      setStatus('authenticated');
    }
  }, [ws]);

  const makeMove = useCallback((from, to, promotion = 'q') => {
    if (ws && ws.readyState === WebSocket.OPEN && game) {
      ws.send(JSON.stringify({ type: 'move', from, to, promotion }));
    }
  }, [ws, game]);

  const resign = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'resign' }));
    }
  }, [ws]);

  const offerDraw = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'offer_draw' }));
    }
  }, [ws]);

  const respondDraw = useCallback((accept) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'respond_draw', accept }));
      setDrawOffer(null);
    }
  }, [ws]);

  const sendChat = useCallback((message) => {
    if (ws && ws.readyState === WebSocket.OPEN && message.trim()) {
      ws.send(JSON.stringify({ type: 'chat', message: message.trim() }));
    }
  }, [ws]);

  const leaveGame = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'leave_game' }));
    }
    setGame(null);
    setGameId(null);
    setPlayerColor(null);
    setOpponent(null);
    setMoves([]);
    setStatus('authenticated');
  }, [ws]);

  useEffect(() => {
    if (user) {
      connect();
    }
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [user, connect]);

  return {
    status,
    game,
    gameId,
    playerColor,
    opponent,
    moves,
    chat,
    drawOffer,
    error,
    findMatch,
    cancelMatch,
    makeMove,
    resign,
    offerDraw,
    respondDraw,
    sendChat,
    leaveGame,
    reconnect: connect
  };
}