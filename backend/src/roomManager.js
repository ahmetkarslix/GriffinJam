import { nanoid } from 'nanoid';
import { DECKS } from './decks.js';

const rooms = new Map();

export function createRoom(deckType = 'fibonacci') {
  const roomId = nanoid(8);
  const deck = DECKS[deckType] || DECKS.fibonacci;

  rooms.set(roomId, {
    id: roomId,
    deck,
    deckType,
    users: new Map(),
    votes: new Map(),
    revealed: false,
    currentTask: '',
    creatorId: null,
    createdAt: Date.now(),
  });

  return roomId;
}

export function getRoom(roomId) {
  return rooms.get(roomId);
}

export function joinRoom(roomId, socketId, userName, isSpectator = false) {
  const room = rooms.get(roomId);
  if (!room) return null;

  // Cancel pending deletion if someone joins back
  if (room.deleteTimeout) {
    clearTimeout(room.deleteTimeout);
    room.deleteTimeout = null;
  }

  room.users.set(socketId, {
    id: socketId,
    name: userName,
    isSpectator,
    joinedAt: Date.now(),
  });

  if (room.creatorId === null) {
    room.creatorId = socketId;
  }

  return room;
}

export function leaveRoom(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.users.delete(socketId);
  room.votes.delete(socketId);

  if (room.users.size === 0) {
    // Don't delete immediately — give time for others to join or reconnect
    room.deleteTimeout = setTimeout(() => {
      const r = rooms.get(roomId);
      if (r && r.users.size === 0) {
        rooms.delete(roomId);
      }
    }, 5 * 60 * 1000); // 5 minutes grace period
  } else if (room.creatorId === socketId) {
    // Transfer creator to the earliest joined user
    const earliest = Array.from(room.users.values()).sort((a, b) => a.joinedAt - b.joinedAt)[0];
    room.creatorId = earliest.id;
  }
}

export function castVote(roomId, socketId, value) {
  const room = rooms.get(roomId);
  if (!room || room.revealed) return false;

  const user = room.users.get(socketId);
  if (!user || user.isSpectator) return false;

  room.votes.set(socketId, value);
  return true;
}

export function revealVotes(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.revealed = true;
  return getVoteResults(room);
}

export function resetVotes(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.votes.clear();
  room.revealed = false;
}

export function setTask(roomId, task) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.currentTask = task;
}

export function changeDeck(roomId, deckType) {
  const room = rooms.get(roomId);
  if (!room) return;

  const deck = DECKS[deckType];
  if (!deck) return;

  room.deck = deck;
  room.deckType = deckType;
  room.votes.clear();
  room.revealed = false;
}

export function updateUserName(roomId, socketId, newName) {
  const room = rooms.get(roomId);
  if (!room) return;

  const user = room.users.get(socketId);
  if (user) {
    user.name = newName;
  }
}

export function toggleSpectator(roomId, socketId, isSpectator) {
  const room = rooms.get(roomId);
  if (!room) return;

  const user = room.users.get(socketId);
  if (user) {
    user.isSpectator = isSpectator;
    if (isSpectator) {
      room.votes.delete(socketId);
    }
  }
}

function getVoteResults(room) {
  const votes = Array.from(room.votes.entries()).map(([socketId, value]) => ({
    userId: socketId,
    userName: room.users.get(socketId)?.name || 'Unknown',
    value,
  }));

  const numericVotes = votes
    .map((v) => parseFloat(v.value))
    .filter((v) => !isNaN(v));

  const average =
    numericVotes.length > 0
      ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
      : null;

  const valueCounts = {};
  votes.forEach((v) => {
    valueCounts[v.value] = (valueCounts[v.value] || 0) + 1;
  });

  const mostVoted = Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    votes,
    average: average !== null ? Math.round(average * 10) / 10 : null,
    mostVoted: mostVoted ? { value: mostVoted[0], count: mostVoted[1] } : null,
    totalVotes: votes.length,
  };
}

export function getRoomState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const users = Array.from(room.users.values());
  const voterCount = users.filter((u) => !u.isSpectator).length;
  const votedCount = room.votes.size;

  const votes = room.revealed ? getVoteResults(room) : null;

  const userStates = users.map((u) => ({
    id: u.id,
    name: u.name,
    isSpectator: u.isSpectator,
    hasVoted: room.votes.has(u.id),
    vote: room.revealed ? room.votes.get(u.id) || null : null,
  }));

  return {
    id: room.id,
    deck: room.deck,
    deckType: room.deckType,
    users: userStates,
    revealed: room.revealed,
    currentTask: room.currentTask,
    creatorId: room.creatorId,
    voterCount,
    votedCount,
    results: votes,
  };
}
