# 🧠 match-engine-lib — Dev Notes

Personal notes, todos, and design ideas while building the core match engine.

---

## ✅ MVP Goal

Build a reusable TypeScript package for managing:

- [x] Lobby creation and joining
- [x] Player data model
- [x] Match confirmation logic
- [ ] In-memory adapter
- [ ] Ports/interfaces for pluggable persistence
- [ ] Core LobbyService logic
- [ ] First test cases using Vitest
- [ ] Minimal README + NPM build

---

## 🔨 TODOs

### Core Logic
- [ ] `LobbyService.createLobby(...)`
- [ ] `LobbyService.joinLobby(...)`
- [ ] `LobbyService.leaveLobby(...)`
- [ ] `LobbyService.confirmLobby(...)`
- [ ] Handle max player limit
- [ ] Prevent duplicate joins

### Models
- [ ] `Lobby`
- [ ] `Player`
- [ ] `CourtSlot`

### Ports / Interfaces
- [ ] `LobbyStore`
- [ ] `SlotStore`
- [ ] `EventBus` (optional)

### Adapters
- [ ] `InMemoryLobbyStore`
- [ ] (Later) `PostgresLobbyStore`
- [ ] (Later) `RedisSlotStore`

---

## 🧪 Testing Plan

- [ ] Use `InMemoryLobbyStore` in test suite
- [ ] Test lobby lifecycle: create → join → full → confirm
- [ ] Edge case: join after full
- [ ] Edge case: leave + rejoin
- [ ] Integration test: flow with fake event emitter

---

## 🧱 Design Principles

- Keep logic **pure** and **stateless** (no DB, no fetch)
- Push I/O to adapters (Clean Architecture)
- Make package testable with zero setup
- Keep API composable: functions + service classes

---

## 📝 Notes

- MVP targets beach volleyball (4-player lobbies)
- Avoid overengineering
