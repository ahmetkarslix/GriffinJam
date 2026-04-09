import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL?.replace(/\/+$/, '');

export const socket = io(SERVER_URL || undefined, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.3,
  timeout: 5000,
});
