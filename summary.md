# 📦 match-engine-lib — Project Summary

This project implements the core matchmaking and lobby logic for player-driven sports games (e.g. beach volleyball), packaged as a reusable TypeScript npm module.

---

## ✅ Goals

- Create a **framework-agnostic, testable** engine for:
  - Lobby creation
  - Player joining/leaving
  - Game confirmation
- Support integration into services, apps, or CLIs
- Follow **Clean Architecture** (ports and adapters)

---

## 🧱 Architecture Overview

### Core Concepts

- **Lobby**: Represents an open/active game session with a max capacity
- **Player**: Minimal identity (ID, nickname, etc.)
- **CourtSlot**: Time/location block a game happens in

### Service Layer

- `LobbyService`: Pure logic for lobby lifecycle
- Methods: `createLobby`, `joinLobby`, `leaveLobby`, `confirmLobby`

### Ports / Interfaces

- `LobbyStore`: CRUD interface for lobbies
- `SlotStore`: (optional) interface for available court slots
- `EventBus`: Optional interface for emitting events

### Adapters

- `InMemoryLobbyStore`: For testing and local dev
- (Planned) `PostgresLobbyStore`, `RedisSlotStore`

---

## 📁 Folder Layout

```
src/
├── core/           # LobbyService and core logic
├── models/         # Domain models (Lobby, Player, etc.)
├── ports/          # Interfaces (e.g. LobbyStore)
├── adapters/       # In-memory and future DB adapters
└── index.ts        # Public API surface
```

---

## 📦 NPM Package

- Name: `match-engine-lib`
- Entry: `dist/index.js` (CJS/ESM via `tsup`)
- Test: `vitest`
- Dev tools: `tsup`, `typescript`, `vitest`

---

## 📋 MVP Features

- [x] Create/join/leave lobbies
- [x] Auto-confirm lobby on full
- [x] In-memory store
- [x] Fully typed API
- [ ] Event publishing
- [ ] Rating/reliability logic
- [ ] Redis/Postgres adapters

---

## 💡 Future Ideas

- Skill-based filters
- Private/public lobby types
- Player reliability tracking
- Payment logic
- Social graph (preferred teammates, block list)
- Integration with court providers
