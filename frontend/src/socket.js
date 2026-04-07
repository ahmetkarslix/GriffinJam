import { io } from 'socket.io-client';

const URL = (import.meta.env.VITE_SERVER_URL || 'http://localhost:3001').replace(/\/+$/, '');

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.3,
  timeout: 5000,
});
