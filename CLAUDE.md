# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GriffinJam is a real-time Planning Poker application (Turkish UI). Users create rooms, invite teammates via link, and vote on story points. No authentication required.

## Commands

```bash
# Install all dependencies (root + backend + frontend)
npm run install:all

# Run both backend and frontend concurrently
npm run dev

# Run individually
npm run dev:backend    # Express + Socket.IO on port 3001
npm run dev:frontend   # Vite dev server on port 5173

# Frontend only
cd frontend && npm run build    # Production build
cd frontend && npm run lint     # ESLint
cd frontend && npm run preview  # Preview production build
```

## Architecture

**Monorepo** with two packages (`backend/` and `frontend/`) and a root `package.json` that orchestrates them via `concurrently`.

### Backend (`backend/`)
- Express + Socket.IO server (ES modules, `node --watch` for dev)
- **No database** — all state is in-memory (`Map` objects in `roomManager.js`)
- Rooms auto-delete when last user disconnects
- `src/index.js` — HTTP routes (`/api/*`) and Socket.IO event handlers
- `src/roomManager.js` — all room/user/vote state management
- `src/decks.js` — card deck definitions (fibonacci, tshirt, hours, emoji)

### Frontend (`frontend/`)
- React 19 + Vite + Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- `react-router-dom` for routing, `socket.io-client` for real-time, `react-hot-toast` for notifications
- `src/socket.js` — singleton Socket.IO client instance (manual connect via `autoConnect: false`)
- `src/pages/Home.jsx` — room creation and join-by-ID/link
- `src/pages/Room.jsx` — main voting room (join modal, voting cards, results, user list)
- `src/components/` — `JoinModal`, `VoteCard`, `UserList`, `Results`

### Communication Pattern
- Room creation: REST `POST /api/rooms` → returns `roomId`
- Room validation: REST `GET /api/rooms/:roomId`
- All real-time interaction: Socket.IO events (`join-room`, `vote`, `reveal-votes`, `reset-votes`, `set-task`, `change-deck`, `update-name`, `toggle-spectator`)
- Single broadcast pattern: every mutation emits `room-updated` with full `getRoomState()` to all room members

### Dev Proxy
Vite proxies `/api` and `/socket.io` to `http://localhost:3001` — frontend calls use relative paths (e.g., `fetch('/api/rooms')`).

## Environment Variables
- `PORT` — backend port (default: 3001)
- `CLIENT_URL` — CORS origin for Socket.IO (default: `http://localhost:5173`)
- `VITE_SERVER_URL` — Socket.IO server URL on frontend (default: `http://localhost:3001`)
