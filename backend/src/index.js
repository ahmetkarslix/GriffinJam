import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { DECKS } from './decks.js';
import {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  castVote,
  revealVotes,
  resetVotes,
  setTask,
  changeDeck,
  updateUserName,
  toggleSpectator,
  getRoomState,
} from './roomManager.js';

// --- Input validation helpers ---
function isNonEmptyString(val, maxLen = 200) {
  return typeof val === 'string' && val.trim().length > 0 && val.length <= maxLen;
}

function isValidDeckType(val) {
  return typeof val === 'string' && Object.keys(DECKS).includes(val);
}

// --- Rate limiting ---
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const RATE_LIMIT_MAX = 15;      // max events per window

function checkRateLimit(socketId) {
  const now = Date.now();
  let entry = rateLimitMap.get(socketId);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    entry = { windowStart: now, count: 0 };
    rateLimitMap.set(socketId, entry);
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

function clearRateLimit(socketId) {
  rateLimitMap.delete(socketId);
}

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 25000,
});

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/decks', (req, res) => {
  res.json(DECKS);
});

app.post('/api/rooms', (req, res) => {
  const { deckType } = req.body;
  if (deckType && !isValidDeckType(deckType)) {
    return res.status(400).json({ error: 'Invalid deck type' });
  }
  const roomId = createRoom(deckType);
  res.json({ roomId });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ exists: true, deckType: room.deckType });
});

// Socket.IO — rate limit middleware
io.use((socket, next) => {
  socket.use(([event], nextEvent) => {
    if (!checkRateLimit(socket.id)) {
      return nextEvent(new Error('Rate limit exceeded'));
    }
    nextEvent();
  });
  next();
});

io.on('connection', (socket) => {
  let currentRoom = null;

  // Helper: broadcast room state with null guard
  function broadcastRoomState(roomId) {
    const state = getRoomState(roomId);
    if (state) {
      io.to(roomId).emit('room-updated', state);
    }
  }

  // Helper: check if socket is room creator
  function isCreator() {
    const room = getRoom(currentRoom);
    return room && room.creatorId === socket.id;
  }

  socket.on('join-room', (data) => {
    try {
      const { roomId, userName, isSpectator } = data || {};

      if (!isNonEmptyString(roomId, 50)) {
        return socket.emit('error', { message: 'Geçersiz oda ID' });
      }
      if (!isNonEmptyString(userName, 50)) {
        return socket.emit('error', { message: 'Geçersiz kullanıcı adı' });
      }

      const room = joinRoom(roomId, socket.id, userName.trim(), !!isSpectator);
      if (!room) {
        return socket.emit('error', { message: 'Oda bulunamadı' });
      }

      currentRoom = roomId;
      socket.join(roomId);
      broadcastRoomState(roomId);
    } catch (err) {
      console.error('join-room error:', err);
      socket.emit('error', { message: 'Odaya katılırken hata oluştu' });
    }
  });

  socket.on('vote', (data) => {
    try {
      if (!currentRoom) return;
      const { value } = data || {};

      if (value !== null && !isNonEmptyString(String(value), 20)) {
        return socket.emit('error', { message: 'Geçersiz oy değeri' });
      }

      castVote(currentRoom, socket.id, value);
      broadcastRoomState(currentRoom);
    } catch (err) {
      console.error('vote error:', err);
    }
  });

  socket.on('reveal-votes', () => {
    try {
      if (!currentRoom || !isCreator()) return;

      revealVotes(currentRoom);
      broadcastRoomState(currentRoom);
    } catch (err) {
      console.error('reveal-votes error:', err);
    }
  });

  socket.on('reset-votes', () => {
    try {
      if (!currentRoom || !isCreator()) return;

      resetVotes(currentRoom);
      broadcastRoomState(currentRoom);
    } catch (err) {
      console.error('reset-votes error:', err);
    }
  });

  socket.on('set-task', (data) => {
    try {
      if (!currentRoom || !isCreator()) return;
      const { task } = data || {};

      if (typeof task !== 'string' || task.length > 500) {
        return socket.emit('error', { message: 'Geçersiz task değeri' });
      }

      setTask(currentRoom, task.trim());
      broadcastRoomState(currentRoom);
    } catch (err) {
      console.error('set-task error:', err);
    }
  });

  socket.on('change-deck', (data) => {
    try {
      if (!currentRoom || !isCreator()) return;
      const { deckType } = data || {};

      if (!isValidDeckType(deckType)) {
        return socket.emit('error', { message: 'Geçersiz deste türü' });
      }

      changeDeck(currentRoom, deckType);
      broadcastRoomState(currentRoom);
    } catch (err) {
      console.error('change-deck error:', err);
    }
  });

  socket.on('update-name', (data) => {
    try {
      if (!currentRoom) return;
      const { name } = data || {};

      if (!isNonEmptyString(name, 50)) {
        return socket.emit('error', { message: 'Geçersiz isim' });
      }

      updateUserName(currentRoom, socket.id, name.trim());
      broadcastRoomState(currentRoom);
    } catch (err) {
      console.error('update-name error:', err);
    }
  });

  socket.on('toggle-spectator', (data) => {
    try {
      if (!currentRoom) return;
      const { isSpectator } = data || {};

      toggleSpectator(currentRoom, socket.id, !!isSpectator);
      broadcastRoomState(currentRoom);
    } catch (err) {
      console.error('toggle-spectator error:', err);
    }
  });

  socket.on('disconnect', () => {
    try {
      clearRateLimit(socket.id);
      if (currentRoom) {
        const roomId = currentRoom;
        leaveRoom(roomId, socket.id);
        broadcastRoomState(roomId);
      }
    } catch (err) {
      console.error('disconnect error:', err);
    }
  });
});

// Serve frontend static files in production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`GriffinJam backend running on port ${PORT}`);
});
