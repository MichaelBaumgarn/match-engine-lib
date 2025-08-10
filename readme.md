# match-engine-lib

> A modular TypeScript library for player matchmaking, lobby management, and team formation — built for sports like beach volleyball, padel, and more.

---

## 🚀 Features

- 🧠 Core logic for managing lobbies and matches
- 🧩 Pluggable interfaces (e.g. for persistence, events)
- ♻️ Reusable in services, apps, or CLI tools
- 🔍 Fully type-safe, testable, and framework-agnostic
- 🧪 Comes with Vitest for easy testing

---

## 📦 Installation

```bash
npm install match-engine-lib
```

Or for development:

```bash
git clone https://github.com/yourname/match-engine-lib.git
cd match-engine-lib
npm install
```

---

## 🛠 Usage Example

```ts
import { LobbyService } from "match-engine-lib";
import { InMemoryLobbyStore } from "match-engine-lib/adapters";

const store = new InMemoryLobbyStore();
const service = new LobbyService(store);

await service.createLobby({
  id: "abc123",
  createdBy: "player1",
  maxPlayers: 4,
  players: [],
});

await service.joinLobby("abc123", { id: "player2", name: "Anna" });
```

---

## 🧩 Architecture

This package follows a **Hexagonal Architecture**:

- `LobbyService`: core business logic
- `LobbyStore`: pluggable persistence interface
- `InMemoryLobbyStore`: default adapter (for testing/dev)
- `MatchProposal`, `Player`, `Slot`, etc.: domain models

---

## 🧪 Scripts

```bash
npm run dev     # Watch tests
npm run test    # Run all tests
npm run build   # Build dist/ with types, CJS, ESM
```

---

## 📁 Folder Structure

```
src/
├── adapters/       # In-memory and other adapters
├── core/           # Core services like LobbyService
├── models/         # Domain models (Lobby, Player, etc.)
├── ports/          # Interface contracts (e.g. LobbyStore)
└── index.ts        # Entry point / public API
```

---

## 📋 Roadmap

- [ ] Postgres adapter
- [ ] Redis queue support
- [ ] Match proposal engine
- [ ] Auto-confirmation policies
- [ ] Player reliability tracking
- [ ] Ratings (Elo / Glicko)

---

## 📄 License

MIT © [Your Name](https://github.com/yourname)
