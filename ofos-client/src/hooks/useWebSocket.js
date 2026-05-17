import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = (orderId, enabled = false) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if enabled and orderId exists
    if (!enabled || !orderId) {
      console.log('WebSocket disabled for now');
      return;
    }

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
    
    try {
      socketRef.current = io(WS_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        socketRef.current.emit('subscribe', { orderId });
      });

      socketRef.current.on('location-update', (data) => {
        setLastMessage(data);
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [orderId, enabled]);

  return { isConnected, lastMessage };
};

export default useWebSocket;